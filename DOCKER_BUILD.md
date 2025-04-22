## **Step-by-Step Guide: Docker Build → Push to Docker Hub → Update Kubernetes Deployment**


### **1. Prerequisites**

Ensure the following:

- Docker is installed and running
- Docker Hub account is active
- A valid `Dockerfile` exists in your project directory
- You have access to `gemini-deployment.yml` (Kubernetes manifest)
- Docker Hub Personal Access Token (PAT) generated if 2FA is enabled

---

### **2. Authenticate with Docker Hub Using a PAT**

1. Go to: https://app.docker.com/settings/personal-access-tokens 
2. Create a **New Access Token** with **Read, write, and delete** permissions  
3. Copy the token securely

Login via terminal:

```bash
docker login -u <your-dockerhub-username>
```

Paste your **access token** when prompted for password.

---

### **3. Build the Docker Image**

From the directory containing the `Dockerfile`, build your image:

```bash
docker build -t gemini-clone .
```

This creates a local image with the name `gemini-clone`.

---

### **4. Tag the Image for Docker Hub**

Tag your local image to match the format required by Docker Hub:

```bash
docker tag gemini-clone <your-dockerhub-username>/gemini-clone:latest
```

**Example:**

```bash
docker tag gemini-clone amitabhsoni/gemini-clone:latest
```

---

### **5. Push the Tagged Image to Docker Hub**

```bash
docker push <your-dockerhub-username>/gemini-clone:latest
```

**Example:**

```bash
docker push amitabhsoni/gemini-clone:latest
```

---

### **6. Update the Kubernetes Deployment (`gemini-deployment.yml`)**

Open the deployment file and set the container image to the pushed version:

```yaml
containers:
  - name: gemini
    image: <existing-docker-image>
```

**Example:**

```yaml
containers:
  - name: gemini
    image: <your-dockerhub-username>/<docker-image-name>:<image-version>
```
