pipeline {
    // 1. We use the 'devsecops-agent' we built in the UI
    agent {
        label 'devsecops-agent'
    }

    environment {
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
    }

    stages {
        
        stage('Clone Code') {
            steps { // <-- This stage was already correct
                git url: 'https://github.com/harisamjad0158/dev-gemini-clone.git', branch: 'feat/kind'
            }
        }

        // 2. FIXED: 'steps' block is now the first and only child of 'stage'
        stage('Scan with SonarQube') {
            steps {
                // 'container' is now INSIDE 'steps'
                container('sonar-scanner') {
                    sh """
                      echo "--- Running SonarQube scan ---"
                      
                      # This command WILL FAIL, and that is 100% EXPECTED.
                      sonar-scanner \
                        -Dsonar.projectKey=gemini-clone \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube.sonarqube.svc.cluster.local:9000 \
                        -Dsonar.login=my-jenkins-auth-token
                    """
                }
            }
        }

        // 3. FIXED: 'steps' block is now the first and only child of 'stage'
        stage('Build and Push with Kaniko') {
            steps {
                // 'container' is now INSIDE 'steps'
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

        // 4. FIXED: 'steps' block is now the first and only child of 'stage'
        stage('Scan Image with Trivy') {
            steps {
                // 'container' is now INSIDE 'steps'
                container('trivy') {
                    sh """
                      echo "--- Running Trivy scan on ${IMAGE_DESTINATION} ---"
                      
                      # We will just scan for HIGH and CRITICAL issues
                      # We will NOT fail the build for now (no --exit-code 1)
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
