declare module "imagetracerjs" {
  interface ImageTracerOptions {
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    blurradius?: number;
    blurdelta?: number;
    strokewidth?: number;
    linefilter?: boolean;
    scale?: number;
    roundcoords?: number;
    desc?: boolean;
    viewbox?: boolean;
    numberofcolors2?: number;
    [key: string]: any;
  }
  const ImageTracer: {
    imageToSVG(
      url: string,
      callback: (svgString: string) => void,
      options?: string | ImageTracerOptions
    ): void;
  };
  export default ImageTracer;
}
