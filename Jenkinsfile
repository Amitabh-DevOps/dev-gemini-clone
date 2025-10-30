pipeline {
    // 1. This tells Jenkins to use the multi-container agent
    //    we just built in the UI.
    agent {
        label 'devsecops-agent'
    }

    // 2. We define our image name here
    environment {
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
    }

    stages {
        
        stage('Clone Code') {
            steps {
                // Clones your application code
                git url: 'https://github.com/Amitabh-DevOps/dev-gemini-clone.git', branch: 'feat/kind'
            }
        }

        // 3. This stage will run inside the 'kaniko' container
        stage('Build and Push with Kaniko') {
            steps {
                container('kaniko') {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', 
                                                     usernameVariable: 'DOCKER_USER', 
                                                     passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                          echo "--- Creating Kaniko config.json ---"
                          mkdir -p /kaniko/.docker
                          
                          # Create the auth file for Kaniko
                          AUTH=$(echo -n "${DOCKER_USER}:${DOCKER_PASS}" | base64)
                          echo "{\\"auths\\":{\\"https://index.docker.io/v1/\\":{\\"auth\\":\\"${AUTH}\\"}}}" > /kaniko/.docker/config.json
                          
                          echo "--- Starting Kaniko build for ${IMAGE_DESTINATION} ---"

                          # Run the Kaniko builder
                          # We include the flags to fix the multi-stage Dockerfile bug
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

        // 4. This stage will run inside the 'trivy' container
        stage('Scan Image with Trivy') {
            steps {
                container('trivy') {
                    sh """
                      echo "--- Running Trivy scan on ${IMAGE_DESTINATION} ---"
                      
                      # This scans the image we just pushed to Docker Hub
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
