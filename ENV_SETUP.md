## Prerequisites: Create a Project in Google Cloud Console & setup OAuth consent screen
- **Project and API Configuration:**
  - Go to the [Google Cloud Console](https://console.cloud.google.com/) and create project.
  - then search for `project` at top search bar
  - select a create a project.
    ![alt text](image-4.png)
  - Enter the name of project (e.g Gemini-Clone) and click on create
    ![alt text](image-5.png)

- **Setup OAuth Consent Screen:**
  - Go to the [Google Cloud Console](https://console.cloud.google.com/) and create or select your production project.
  - Select your created Project, navigate to **APIs & Services** → **OAuth consent screen**.
  - click on get started
    ![alt text](image-10.png)
  - Fill all detail
    - fill app info and click next
      ![alt text](image-11.png)
    - Select External and click next
      ![alt text](image-12.png)
    - enter email in contact info and click next
      ![alt text](image-13.png)
    - Check the agree option click on continue
      ![alt text](image-14.png)
    - then finally create on create.

    - and all set
    - now follow below steps
    - Make sure to select your this created project every time you create anything to Google cloud console
    - by clicking on right side of Google cloud you can select your created project
      ![alt text](image-6.png)  

---


## 1. Google OAuth Credentials (GOOGLE_ID & GOOGLE_SECRET)

**Purpose:**  
These credentials authenticate your users via Google’s OAuth 2.0 service.

**Production Setup Steps:**

- **Project and API Configuration:**
  - Go to the [Google Cloud Console](https://console.cloud.google.com/) and create or select your production project.

- **Creating OAuth Credentials:**
  - Select your created Project, navigate to **APIs & Services** → **Credentials**.
  - In **Credentials**, click **Create Credentials** → **OAuth client ID**.
  - Choose **Web Application** and enter a name.
  - Under **Authorized JavaScript origins** and **Authorized redirect URIs**, add your production domain. For example:
    - In **Authorized JavaScript origins**:
      - `http://your-production-domain.com`
      - `https://your-production-domain.com`
    - In **Authorized redirect URIs**:
      - `http://your-production-domain.com/api/auth/callback/google`
      - `https://your-production-domain.com/api/auth/callback/google`
  - reference image: 
    ![alt text](image.png)
  - click on create
  - reference image: 
    ![alt text](image-1.png)
  - Copy the **Client ID** and **Client Secret**:
    - Paste the Client ID in **GOOGLE_ID** of `.env.local`(create .env.local by copying the `.env.sample`).
    - Paste the Client Secret in **GOOGLE_SECRET** of `.env.local`.
  - click on ok.

---

## 2. Google API Key (NEXT_PUBLIC_API_KEY)

**Purpose:**  
This key authenticates client-side requests to various Google APIs (Maps, Places, and in this case, the Generative Language API).

**Production Setup:**

- **Obtain the API Key:**
  - In the [Google Cloud Console](https://console.cloud.google.com/), Select your created Project, navigate to **APIs & Services** → **Credentials**.
  - Click **Create Credentials** → **API key** to generate a key.
    ![alt text](image-8.png)
    ![alt text](image-9.png)

- **Restrict the API Key:**
  - **API Restrictions:**  
    Restrict the key to only the necessary Google APIs such as the Generative Language API.
    - to restrict for use of Generative Language API only. 
    - click on that key
    - in API restrictions select Restrict key and select `Generative Language API` from searching it and click on save, now your key is restrict to use only Generative Language API
      ![alt text](image-7.png)
    - and all set, copy that key and paste that key into `NEXT_PUBLIC_API_KEY` of `.env.local`
    - skip the below alternative way, if you done till now.
  
- **Alternative Way for API Key Generation:**
  - You can also generate your next public API key using the following URL:  
    [https://aistudio.google.com/u/0/apikey](https://aistudio.google.com/u/0/apikey)

  - Login with same gmail account as of used ot login Google cloud console 
  - then click on create api key and select your create project and boom your api key will automatacly added to google cloud console in your project credentials
    ![alt text](image-2.png)
    ![alt text](image-3.png)
  - this key is automatecally restrict to use only Generative Language API
  - and all set, copy that key and paste that key into `NEXT_PUBLIC_API_KEY` of `.env.local`
---

## 3. NextAuth Secret (NEXTAUTH_SECRET)

**Purpose:**  
This secret secures sessions and token encryption for NextAuth.

**Production Setup:**

- **Generate a Secure Secret:**

> [!NOTE]
> Node.js should be installed on your system (laptop) to generate this secret. Download it from [https://nodejs.org/en/download](https://nodejs.org/en/download) if needed.
> Also it will be generated in your root dir `dev-gemini-clone`, because it needs `package.json` to be present in your dir.

  - Generate a secure random string using Node.js:
  - Go to VSCode where you have cloned that repo and go inside `cd dev-gemini-clone`
  - make sure package.json file is there and run below command 
  - it will automatacally create `.env.local` if not then create it by own
    ```bash
    npx auth secret
    ```
- **Usage:**
  - Set the generated value as **NEXTAUTH_SECRET** in your `.env.local`.
  - Make sure your Key name for that is **NEXTAUTH_SECRET**, not anything.

---

## 4. Base URL for the Application (NEXTAUTH_URL)

**Purpose:**  
This URL specifies your application’s canonical domain for constructing callback URLs and other endpoints in NextAuth.

**Production Setup:**

- **Set the Production URL:**
  - Replace your development URL with your production domain. For example:
    ```
    NEXTAUTH_URL=https://your-production-domain.com
    ```
- **Configuration:**
  - Ensure this URL is included in your environment configuration and exactly matches what is specified in your OAuth credentials for authorized domains in Google Cloud console.

---

## 5. MongoDB Connection String (MONGODB_URI)

**Purpose:**  
The connection string directs your application to your MongoDB database hosted on Atlas.

**Production Setup Using MongoDB Atlas:**

- **Set Up Your Atlas Cluster:**
  - Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a cluster.
  - click on create
    ![alt text](image-15.png)
  - Select free option(Note if you have already created one then it will not show the free one) and enter a Cluster name then click on create deployment
  - Now it will popuped with Connect to <Your-cluster-name>
    ![alt text](image-20.png)
  - Copy both username and password and stored at somewhere.
  - then click on create Database user
  - After that click on Choose connection method, then click on compass
  - after that select if you have mongodb compass or not 
  - select your operatem system, and download and launch that compass
  - after that copy that connection string by making on show password so that it will show your password also in string
  - after copying that string paste it to **MONGODB_URI** in your `.env.local`
  - then click on done
  - now you are all set

> [!NOTE]
>
> If you are doing for first time then only above is correct sequence, if doing second time then you know how to do all stuff, make sure to store database username and password so that if you are doing second time then it will not irritate you, then you can easly get connection string and paste your database username and password.


---


## General Best Practices for Production Environments

- **Environment Variable Management:**
  - Use environment-specific configuration files (e.g., `.env.production`) and ensure these files are excluded from version control.
  - Consider leveraging secrets management solutions such as Google Secret Manager, AWS Secrets Manager, or HashiCorp Vault for enhanced security.

- **Secure Network and Access:**
  - Restrict access to your databases and external services using IP whitelisting, VPNs, or Virtual Private Clouds (VPCs).
  - Enforce HTTPS to secure data in transit.

- **Regular Auditing and Rotation:**
  - Continuously monitor, audit, and rotate credentials such as API keys and secrets according to your organization’s security policies.
  - Set up alerts for any unusual activity or unauthorized access attempts.

- **Logging and Monitoring:**
  - Implement comprehensive logging and monitoring for both your application and its interactions with external APIs.
  - Consider integrating with cloud provider tools or third-party solutions to help detect and respond to security incidents.

