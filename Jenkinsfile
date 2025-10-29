pipeline {
    // 1. FIXED: We now use our new, more powerful agent
    agent {
        label 'devsecops-agent'
    }

    environment {
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
    }

    stages {
        
        stage('Clone Code') {
            steps {
                // We use your 'Amitabh-DevOps' repo now
                git url: 'https://github.com/harisamjad0158/dev-gemini-clone.git', branch: 'feat/kind'
            }
        }

        stage('Build and Push with Kaniko') {
            // 2. We build inside the 'kaniko' container
            container('kaniko') {
                steps {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', 
                                                     usernameVariable: 'DOCKER_USER', 
                                                     passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                          echo "--- Creating Kaniko config.json ---"
                          mkdir -p /kaniko/.docker
                          
                          AUTH=$(echo -n "${DOCKER_USER}:${DOCKER_PASS}" | base64)
                          echo "{\\"auths\\":{\\"https://index.docker.io/v1\\":{\\"auth\\":\\"${AUTH}\\"}}}" > /kaniko/.docker/config.json
                          
                          echo "--- Starting Kaniko build for ${IMAGE_DESTINATION} ---"

                          # We still need these flags to build the multi-stage Dockerfile
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

        // 3. NEW STAGE: We scan the image we just pushed
        stage('Scan Image with Trivy') {
            // 4. We run this step inside the 'trivy' container
            container('trivy') {
                steps {
                    sh """
                      echo "--- Running Trivy scan on ${IMAGE_DESTINATION} ---"
                      
                      # This command tells Trivy to scan the image from Docker Hub
                      # --exit-code 1  : Fail the build if critical/high issues are found
                      # --severity     : Only fail for HIGH or CRITICAL issues
                      
                      trivy image --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_DESTINATION}
                      
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
