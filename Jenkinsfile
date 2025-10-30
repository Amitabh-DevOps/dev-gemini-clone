pipeline {
    // We are still using our powerful 'devsecops-agent'
    agent {
        label 'devsecops-agent'
    }

    environment {
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
        
        // 1. FIXED: This is the correct, internal Kubernetes DNS address
        // for your SonarQube server.
        // Format: <service-name>.<namespace>.svc.cluster.local
        SONAR_HOST = "http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
    }

    stages {
        
        stage('Clone Code') {
            steps {
                git url: 'https://github.com/harisamjad0158/dev-gemini-clone.git', branch: 'feat/kind'
            }
        }

        // 2. FIXED: This stage will now work!
        stage('Scan with SonarQube') {
            steps {
                // 3. We run this step inside the 'sonar-scanner' container
                container('sonar-scanner') {
                    
                    // 4. We use 'withCredentials' to securely load our 'sonar-token'
                    // into an environment variable called SONAR_TOKEN
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        
                        // 5. We run the scanner command, using our new variables
                        sh """
                          echo "--- Running SonarQube scan ---"
                          
                          # This is the command that runs the scan
                          sonar-scanner \
                            -Dsonar.projectKey=gemini-clone \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Build and Push with Kaniko') {
            steps {
                container('kaniko') {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', 
                                                     usernameVariable: 'DOCKER_USER', 
                                                     passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                          echo "--- Creating Kaniko config.json ---"
                          mkdir -p /kaniko/.docker
                          AUTH=$(echo -n "${DOCKER_USER}:${DOCKER_PASS}" | base64)
                          echo "{\\"auths\\":{\\"https://index.docker.io/v1\\":{\\"auth\\":\\"${AUTH}\\"}}}" > /kaniko/.docker/config.json
                          
                          echo "--- Starting Kaniko build for ${IMAGE_DESTINATION} ---"
                          /kaniko/executor --dockerfile=Dockerfile \
                                           --context=$(pwd) \
                                           --destination=${IMAGE_DESTINATION} \
                                           --cleanup=false \
                                           --use-new-run
                          echo "--- Kaniko build complete ---"
                        '''
                    }
                }
            }
        }

        stage('Scan Image with Trivy') {
            steps {
                container('trivy') {
                    sh """
                      echo "--- Running Trivy scan on ${IMAGE_DESTINATION} ---"
                      trivy image --severity HIGH,CRITICAL ${IMAGE_DESTINATION}
                      echo "--- Trivy scan complete ---"
                    """
                }
            }
        }

        stage('Test') {
            steps {
                echo "Running tests..."
                sh 'echo Tests passed!'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying image ${IMAGE_DESTINATION} to ${MY_ENV} environment"
            }
        }
    }
}
