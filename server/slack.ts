import slackBolt from "@slack/bolt";
import nodeCanvas from "canvas";
import { JSDOM } from "jsdom";
import type {
  ErrorCorrectionLevel,
  Mode,
  Options,
  TypeNumber,
} from "qr-code-styling";
import QRCodeStyling from "qr-code-styling";

const { App } = slackBolt;

let app: InstanceType<typeof App> | null = null;

function createApp() {
  if (!app) {
    app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
    });

    app.command("/qr", async ({ command, ack, client }) => {
      // Tell Slack we're doing _somemthing_
      await ack();

      // Try and join the channel the message was from
      try {
        if (app) {
          await app.client.conversations.join({
            channel: command.channel_id,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }

      const options: Options = {
        width: 500,
        height: 500,
        type: "svg",
        jsdom: JSDOM,
        nodeCanvas,
        data: "text to encode in QR codeasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf",
        image: "/app/public/RAR-square-Logo.png",
        margin: 2,
        qrOptions: {
          typeNumber: 0 as TypeNumber,
          mode: "Byte" as Mode,
          errorCorrectionLevel: "H" as ErrorCorrectionLevel,
        },
        imageOptions: {
          saveAsBlob: true,
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 2,
          crossOrigin: "anonymous",
        },
        dotsOptions: {
          color: "#000000",
          type: "square",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
      };

      const qrCode = new QRCodeStyling(options);
      qrCode.getRawData("png").then((buffer) => {
        if (buffer) {
          // Upload the QR code image to Slack
          client.files.uploadV2({
            channel_id: command.channel_id,
            initial_comment: `Generated QR code for: ${command.text}`,
            filename: "qr.png",
            file: buffer.toString(),
          });
        } else {
          // If we failed to generate the QR code, send an error message
          client.chat.postMessage({
            channel: command.channel_id,
            text: "Failed to generate QR code.",
          });
        }
      });
    });
  }
  return app;
}

export default {
  start: async (port: string | number) => {
    const slackApp = createApp();
    await slackApp.start(port);
  },
};
