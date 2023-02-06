import Loader from 'react-loader-spinner';

export default function ReactLoader({color, size, loaderClass}) {
  return (
    <Loader
      type="TailSpin"
      color={color}
      height={size}
      width={size}
      className={loaderClass}
    />
  );
}