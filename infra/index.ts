import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const config = new pulumi.Config();
const postgresPort = parseInt(config.get("postgresPort") || "5433", 10);
const rabbitmqPort = parseInt(config.get("rabbitmqPort") || "15672", 10);

// 1. Create Docker Network
const network = new docker.Network("tdhp-ledger-net", {
  name: "tdhp_ledger_net",
});

// 2. PostgreSQL Infrastructure Resource
const postgresImage = new docker.RemoteImage("postgres-img", {
  name: "postgres:16-alpine",
});

const postgresContainer = new docker.Container("tdhp-postgres", {
  image: postgresImage.repoDigest,
  name: "tdhp_postgres_pulumi",
  envs: [
    "POSTGRES_USER=postgres",
    "POSTGRES_PASSWORD=postgres",
    "POSTGRES_DB=tdhp_ledger_dev",
  ],
  ports: [
    {
      internal: 5432,
      external: postgresPort,
    },
  ],
  networksAdvanced: [
    {
      name: network.name,
    },
  ],
  restart: "unless-stopped",
});

// 3. RabbitMQ Message Queue Infrastructure Resource
const rabbitmqImage = new docker.RemoteImage("rabbitmq-img", {
  name: "rabbitmq:3-management-alpine",
});

const rabbitmqContainer = new docker.Container("tdhp-rabbitmq", {
  image: rabbitmqImage.repoDigest,
  name: "tdhp_rabbitmq_pulumi",
  envs: [
    "RABBITMQ_DEFAULT_USER=guest",
    "RABBITMQ_DEFAULT_PASS=guest",
  ],
  ports: [
    {
      internal: 5672,
      external: 5672,
    },
    {
      internal: 15672,
      external: rabbitmqPort,
    },
  ],
  networksAdvanced: [
    {
      name: network.name,
    },
  ],
  restart: "unless-stopped",
});

// Export Pulumi Infrastructure Stack Outputs
export const postgresUrl = pulumi.interpolate`postgresql://postgres:postgres@localhost:${postgresPort}/tdhp_ledger_dev`;
export const rabbitmqDashboard = pulumi.interpolate`http://localhost:${rabbitmqPort}`;
export const phoenixApiTarget = "http://localhost:4000/api";
export const nextWebTarget = "http://localhost:3000";
