// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  SERVER_SOCKET_URL: "wss://rfappq.abbvienet.com/Abbvie.Corp.Cop.RapidflowNG1.0/WSService.svc",
  WEB_SERVER_URL: "https://rfappq.abbvienet.com/AbbVie.Corp.Cop.RapidflowNG1.0",
  MINIMUM_SUPPORTED_DEVICE_LONGEDGE_REPORTS: "1334",
  RAPIDFLOW_VERSION: "6.0",
  BUILD_NUMBER: "DEV-1.1.8",
  SOCKET_CONNECTION_RETRIES: 3
};
