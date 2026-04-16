# Service Reliability Monitor

Periodically checks web service endpoints, records availability, latency, and version identity, and surfaces the results on a live dashboard.

<img width="2869" height="1254" alt="Screenshot 2026-04-16 073024" src="https://github.com/user-attachments/assets/5cf0d159-28e8-4d00-a046-6f36b1a80626" />
<img width="1889" height="988" alt="Screenshot 2026-04-16 073038" src="https://github.com/user-attachments/assets/534f4602-a9b6-4bf0-91fc-b068d3924159" />

## Quickstart

### Docker (for Windows)
```bash
docker-compose up --build
```

Open [http://localhost:8000](http://localhost:8000).  
API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### List of Monitoring Services
Modifiable configuration file at: ```backend/services.yaml```
Feel free to modify any of the fields to see how it displays on the UI.

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
#### Engineered via AI-assisted Software Development Lifecycle (SDLC)
