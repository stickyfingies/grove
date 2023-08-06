import {
    BufferAttribute,
    BufferGeometry,
    CylinderBufferGeometry,
    Mesh,
    MeshPhongMaterial,
    SphereBufferGeometry,
} from 'three';

export default class GraphicsUtils {
    static makeBall(radius: number, norotate?: boolean) {
        const geometry = new SphereBufferGeometry(radius, 32, 32);
        const material = new MeshPhongMaterial({ color: 0x00CCFF });
        const mesh = new Mesh(geometry, material);

        mesh.userData.norotate = norotate;

        return mesh;
    }

    static makeCapsule(radius: number, height: number) {
        const material = new MeshPhongMaterial({ color: 0x00CCFF });

        const cGeometry = new CylinderBufferGeometry(radius, radius, height, 32);
        const sGeometry = new SphereBufferGeometry(radius, 32, 32);

        const cMesh = new Mesh(cGeometry, material);
        const stMesh = new Mesh(sGeometry, material);
        const sbMesh = new Mesh(sGeometry, material);
        stMesh.position.y = height / 2;
        sbMesh.position.y = -height / 2;
        cMesh.add(stMesh);
        cMesh.add(sbMesh);

        return cMesh;
    }

    static makeCylinder(radius: number, height: number) {
        const geometry = new CylinderBufferGeometry(radius, radius, height);
        const material = new MeshPhongMaterial({ color: 0x00CCFF });
        const mesh = new Mesh(geometry, material);

        return mesh;
    }

    /**
     * Creates a temporary canvas element and returns its context.
     * @note may leak memory if `canvas` is never deleted (unsure though).
     */
    static scratchCanvasContext(width: number, height: number) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return { canvas, ctx: canvas.getContext('2d')! };
    }

    static getRawImageData(image: HTMLImageElement): ImageData {
        const { width, height } = image;
        const { ctx } = GraphicsUtils.scratchCanvasContext(width, height);
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, width, height);
    }

    static updateBufferAttribute(geometry: BufferGeometry, name: string, raw_data: number[]) {
        const { itemSize, count } = geometry.getAttribute(name);

        // replace buffer with an appropriately sized one, if necessary
        if (raw_data.length !== count * itemSize) {
            const replacement = new BufferAttribute(new Float32Array(raw_data.length), itemSize);
            geometry.setAttribute(name, replacement);
        }

        // write data to attribute buffer
        const buffer = geometry.getAttribute(name);
        for (let i = 0; i < count; i++) {
            if (itemSize === 3) {
                const x = raw_data[i * 3 + 0];
                const y = raw_data[i * 3 + 1];
                const z = raw_data[i * 3 + 2];
                buffer.setXYZ(i, x, y, z);
            }
            else if (itemSize === 1) {
                buffer.setX(i, raw_data[i]);
            }
        }
        buffer.needsUpdate = true;
    }
}
