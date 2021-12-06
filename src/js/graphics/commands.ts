export type GraphicsInitCmd = {
    type: 'init',
    canvas: OffscreenCanvas,
    buffer: SharedArrayBuffer,
}

export type GraphicsUploadTextureCmd = {
    type: 'uploadTexture',
    imageId: string,
    imageWidth: number,
    imageHeight: number,
    imageData: ArrayBufferView,
    ui: boolean
}

export type GraphicsAddObjectCmd = {
    type: 'addObject',
    data: any,
    id: number,
    ui: boolean
}

export type GraphicsRemoveObjectCmd = {
    type: 'removeObject',
    id: number
}

export type GraphicsResizeCmd = {
    type: 'resize',
    width: number,
    height: number,
    pixelRatio: number
}

export type GraphicsUpdateMaterialCmd = {
    type: 'updateMaterial'
    material: any,
    id: number,
}

/**
 * Represents any of the possible commands from frontend -> backend
 */
export type IGraphicsCommand
    = GraphicsInitCmd
    | GraphicsUploadTextureCmd
    | GraphicsAddObjectCmd
    | GraphicsRemoveObjectCmd
    | GraphicsResizeCmd
    | GraphicsUpdateMaterialCmd;
