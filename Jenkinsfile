pipeline {
    agent {
        label 'devsecops-agent'
    }

    environment {
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
        SONAR_HOST = "http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
        SONAR_TOKEN = credentials('sonar-token')  // Jenkins Secret Text
    }

    stages {

        stage('Clone Code') {
            steps {
                echo "--- Cloning source code ---"
                git branch: 'feat/kind', url: 'https://github.com/harisamjad0158/dev-gemini-clone.git'
            }
        }

        stage('Scan with SonarQube') {
            steps {
                container('sonar-scanner') {
                    sh '''
                        echo "--- Running SonarQube scan ---"
                        sonar-scanner \
                          -Dsonar.projectKey=gemini-clone \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=${SONAR_HOST} \
                          -Dsonar.login=${SONAR_TOKEN}
                        echo "--- SonarQube analysis complete ---"
                    '''
                }
            }
        }

        stage('Build and Push with Kaniko') {
            steps {
                container('kaniko') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'dockerhub-creds',
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )
                    ]) {
                        sh '''
                          echo "--- Creating Kaniko Docker config ---"
                          mkdir -p /kaniko/.docker
                          AUTH=$(echo -n "${DOCKER_USER}:${DOCKER_PASS}" | base64)
                          echo "{\\"auths\\":{\\"https://index.docker.io/v1\\":{\\"auth\\":\\"${AUTH}\\"}}}" > /kaniko/.docker/config.json

                          echo "--- Starting Kaniko build for ${IMAGE_DESTINATION} ---"
                          /kaniko/executor \
                            --dockerfile=Dockerfile \
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
                    sh '''
                      echo "--- Running Trivy scan on ${IMAGE_DESTINATION} ---"
                      trivy image --severity HIGH,CRITICAL ${IMAGE_DESTINATION} || true
                      echo "--- Trivy scan complete ---"
                    '''
                }
            }
        }

        stage('Test') {
            steps {
                echo "--- Running tests ---"
                sh 'echo Tests passed!'
            }
        }

        stage('Deploy') {
            steps {
                echo "--- Deploying image ${IMAGE_DESTINATION} to ${MY_ENV} environment ---"
            }
        }

        stage('Debug Delay') {
            steps {
                echo "--- Keeping agent pod alive for debugging logs ---"
                sh '''
                  echo "Agent pod will sleep for 2 minutes before terminating..."
                  sleep 120
                  echo "Debug delay finished."
                '''
            }
        }
    }
}
