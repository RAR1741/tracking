declare module "qr-code-styling-node/lib/qr-code-styling.common.js" {
  interface QRCodeStylingOptions {
    width?: number;
    height?: number;
    data?: string;
    image?: string;
    dotsOptions?: {
      color?: string;
      type?:
        | "square"
        | "rounded"
        | "classy"
        | "classy-rounded"
        | "extra-rounded";
    };
    backgroundOptions?: {
      color?: string;
    };
    qrOptions?: {
      errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    };
    imageOptions?: {
      crossOrigin?: string;
      margin?: number;
    };
    cornersSquareOptions?: {
      color?: string;
      type?: "square" | "extra-rounded";
    };
    cornersDotOptions?: {
      color?: string;
      type?: "square" | "dot";
    };
    nodeCanvas?: any;
  }

  class QRCodeStyling {
    constructor(options: QRCodeStylingOptions);
    getRawData(extension: "png" | "jpeg" | "webp"): Promise<Buffer>;
    update(options: Partial<QRCodeStylingOptions>): void;
  }

  export = QRCodeStyling;
}

declare module "qr-code-styling-node" {
  import QRCodeStyling from "qr-code-styling-node/lib/qr-code-styling.common.js";
  export = QRCodeStyling;
}
