/* eslint-disable no-console */
import type { Route } from "./+types/qr.js";

import * as nodeCanvas from "canvas";
import QRCodeStyling from "qr-code-styling-node/lib/qr-code-styling.common.js";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "QR Codes" },
    { name: "description", content: "QR code generator" },
  ];
}

const genQRCode = async (text: string) => {
  // QR code options
  const options = {
    width: 500,
    height: 500,
    data: text,
    image:
      "https://cdn.glitch.global/9c8a8df4-539c-42ca-aae4-0d8cc2a11a85/NewRARLogo.png?v=1714802634463",
    dotsOptions: {
      color: "#000000",
      type: "square" as const,
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    qrOptions: {
      errorCorrectionLevel: "H" as const,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 2,
    },
  };

  const qrCodeImage = new QRCodeStyling({
    nodeCanvas,
    ...options,
  });

  const image = await qrCodeImage.getRawData("png");
  console.log("QR Code generated successfully");
  console.log(image);

  return image;
};

// export async function loader({ context, request }: Route.LoaderArgs) {
//   const db = database();

//   // Get session information - create proper Headers object
//   const session = await auth.api.getSession({
//     headers: request.headers,
//   });

//   // Check if user can manage users
//   let canManageUsers = false;
//   if (session?.user) {
//     const authContext = createAuthContextFromSession(session);
//     const permissions = createPermissionChecker(authContext);
//     try {
//       canManageUsers = await permissions.can(PERMISSIONS.USER_UPDATE);
//     } catch {
//       // If permission check fails, default to false
//       canManageUsers = false;
//     }
//   }

//   const guestBook = await db.query.guestBook.findMany({
//     columns: {
//       id: true,
//       name: true,
//     },
//   });

//   return {
//     guestBook,
//     message: context.VALUE_FROM_EXPRESS,
//     session,
//     canManageUsers,
//   };
// }

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export default function Qr({ actionData, loaderData }: Route.ComponentProps) {
  genQRCode("Sample QR Code Text");

  return (
    <>
      <h1>QR Code Generator</h1>
      <p>Generate and manage your QR codes.</p>
    </>
  );
}
