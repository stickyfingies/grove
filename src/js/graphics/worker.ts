import GraphicsBackend from './backend';

const backend = new GraphicsBackend();

onmessage = ({ data }) => {
  const type = data.type as string;
  backend[type](data);
};
