import GraphicsBackend from './graphicsbackend';

const backend = new GraphicsBackend();

onmessage = ({ data }) => {
  const type = data.type as string;

  switch (type) {
    case 'init':
      backend.init(data);
      break;
    case 'uploadTexture':
      backend.uploadTexture(data);
      break;
    case 'addObject':
      backend.addObject(data);
      break;
    case 'removeObject':
      backend.removeObject(data);
      break;
    case 'resize':
      backend.resize(data);
      break;
    default:
      console.error(`[Graphics Worker] command ${type} is not known`);
  }
};
