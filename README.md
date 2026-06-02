# Service Reliability Monitor

Periodically checks web service endpoints, recording availability, latency, and version identity while surfacing results on a live dashboard.

#### Built using:
[![FastAPI](https://img.shields.io/badge/-Fast--API-2f988a?style=for-the-badge)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/-Docker-375efb?style=for-the-badge)](https://www.docker.com)
[![React](https://img.shields.io/badge/-React-8acff3?style=for-the-badge)](https://react.dev)
[![Material UI](https://img.shields.io/badge/-Material--UI-2d87ce?style=for-the-badge)](https://mui.com/material-ui)


<img width="1435" height="627" alt="Screenshot 2026-04-16 073024" src="https://github.com/user-attachments/assets/3818638a-8e56-4a6b-a555-6101e5de3739" />

## Quickstart

### Build Docker image
For Windows:
```bash
docker-compose up --build
```

#### Open on browser: [http://localhost:8000](http://localhost:8000) 

#### View API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

<br>

### List of Monitoring Services
Modifiable configuration file at: ```backend/services.yaml```
<br><br>
### View Version Drift
View the <b>version drift</b> by clicking on the drift alert for service:

<img width="945" height="495" alt="Screenshot 2026-04-16 073038" src="https://github.com/user-attachments/assets/534f4602-a9b6-4bf0-91fc-b068d3924159" />

---

## Design Overview

**Config-driven:** Services are defined in `services.yaml` (name, URL, environment, expected version).

**Poller:** APScheduler runs an async poll cycle every N seconds (default 30). Each cycle checks all configured services concurrently, writes a `CheckResult` row per service, then evaluates the alerting threshold.

**Trade-offs:**
- The frontend polls the REST API every 15 seconds rather than using WebSockets. This is sufficient for a health dashboard and eliminates connection-management complexity.
- APScheduler (in-process) was preferred over Celery/Redis because it removes an entire infrastructure dependency for a tool of this scope.
- Static files are served by FastAPI in Docker (single container) rather than a separate Nginx container. This keeps the compose file minimal.

---

## Infrastructure / Deployment Notes

In production, this would be deployed as two services: the FastAPI container and a managed PostgreSQL instance (RDS). 
The container image can be built by a CI pipeline (AWS CodePipeline) on every merge to `main`, tagged with the commit SHA, and pushed to ECR. It would then be deployed by AWS CodeBuild updating the images in ECS Fargate tasks placed within a management VPC. 
This VPC requires peering connections to both Staging and Production VPCs to ensure network connections to internal endpoints aren't exposed to the public internet.

The app container can run behind an Application Load Balancer with a `/api/services/` health path. AWS CloudWatch Synthetics Canary can be setup to check the Application Load Balancer. If the application goes down, CloudWatch will alert the infrastructure team.

---
<p align="center">
    Developed by
</p>

<div align="center"> 

[![Author](https://img.shields.io/badge/-Sophia--Halapchuk-9ae0d0?style=flat-square)](https://www.linkedin.com/in/sophia-halapchuk)
[![Author](https://img.shields.io/badge/-@micattoc-eebc81?style=flat-square)](https://github.com/micattoc)

</div>
