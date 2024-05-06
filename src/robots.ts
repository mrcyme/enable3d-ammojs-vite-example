import { ExtendedObject3D, Scene3D, THREE } from 'enable3d';

// Define the structure for each robot part
export interface RobotPart {
  mesh: string;      // Path to the .glb file
  t: number[];       // Translation vector [x, y, z]
  q: number[];       // Quaternion [q0, q1, q2, q3]
}

// Define the structure for the robot dictionary
export interface RobotDictionary {
  [key: string]: RobotPart;
}

function convertZUpToYUp(t: number[], q: number[]): { position: THREE.Vector3, quaternion: THREE.Quaternion } {
    // New position: Z becomes Y, Y becomes -Z
    const position = new THREE.Vector3(t[0], t[2], -t[1]);

    // Create the initial quaternion
    const quaternion = new THREE.Quaternion(q[0], q[2], -q[1], q[3]);

    // Create a rotation quaternion (90 degrees around the X axis)
    const qX90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 2*Math.PI);

    // Apply rotation to the initial quaternion
    quaternion.premultiply(qX90);

    return { position, quaternion };
}

// Function to load a robot into a scene
export async function loadRobot(robotData: RobotDictionary, scene: Scene3D) {
  for (const key in robotData) {
    const part = robotData[key];
    const { position, quaternion } = convertZUpToYUp(part.t, part.q);

    await scene.load.gltf(part.mesh).then(gltf => {
      let object = new ExtendedObject3D()
      const mesh = gltf.scene.children[0]
  
      // Set the converted position and quaternion
      object.position.copy(position);
      object.quaternion.copy(quaternion);
      object.add(mesh);
      scene.add.existing(object);
      
      // Uncomment the following if physics are needed
      // scene.physics.add.existing(object, { shape: 'mesh' });
    });
  }
}


