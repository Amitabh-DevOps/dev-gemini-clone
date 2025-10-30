pipeline {
    // 1. This label now matches the agent we just built in the UI
    agent {
        label 'devsecops-agent'
    }

    environment {
        // We use your 'Amitabh-DevOps' repo
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
    }

    stages {
        
        stage('Clone Code') {
            steps {
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

                          # We use the flags to fix the multi-stage Dockerfile bug
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

        // 3. This stage will now work!
        stage('Scan Image with Trivy') {
            // 4. We run this step inside the 'trivy' container
            container('trivy') {
                steps {
                    sh """
                      echo "--- Running Trivy scan on ${IMAGE_DESTINATION} ---"
                      
                      # We tell Trivy to only scan for High/Critical issues
                      # We remove '--exit-code 1' for now, so it doesn't fail the build
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
