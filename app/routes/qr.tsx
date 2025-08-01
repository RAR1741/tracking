import type {
  ErrorCorrectionLevel,
  Mode,
  Options,
  TypeNumber,
} from "qr-code-styling";
import type { Route } from "./+types/qr.js";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "QR Codes" },
    { name: "description", content: "QR code generator" },
  ];
}

export async function loader() {
  const nodeCanvas = (await import("canvas")).default;
  const { JSDOM } = await import("jsdom");
  const QRCodeStyling = (await import("qr-code-styling")).default;

  const options: Options = {
    width: 300,
    height: 300,
    type: "svg",
    jsdom: JSDOM,
    nodeCanvas,
    data: "http://qr-code-styling.com",
    image:
      "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png",
    margin: 10,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      mode: "Byte" as Mode,
      errorCorrectionLevel: "Q" as ErrorCorrectionLevel,
    },
    imageOptions: {
      saveAsBlob: true,
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 20,
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      color: "#222222",
    },
    backgroundOptions: {
      color: "#5FD4F3",
    },
  };

  const qrCode = new QRCodeStyling(options);
  const buffer = await qrCode.getRawData("svg");
  const svg = buffer?.toString();

  return {
    message: "QR Code generator is ready",
    svg,
  };
}

export default function Qr({ loaderData }: Route.ComponentProps) {
  const { svg } = loaderData;

  return (
    <>
      <h1>QR Code Generator</h1>
      <p>Generate and manage your QR codes.</p>
      <br />
      {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : null}
    </>
  );
}
