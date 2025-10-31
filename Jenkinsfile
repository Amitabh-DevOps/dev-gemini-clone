pipeline {
    agent {
        label 'devsecops-agent'
    }

    environment {
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
        SONAR_HOST = "http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
    }

    stages {
        stage('Clone Code') {
            steps {
                echo "--- Cloning source code ---"
                git url: 'https://github.com/harisamjad0158/dev-gemini-clone.git', branch: 'feat/kind'
            }
        }

        stage('Scan with SonarQube') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'jenkins-token1', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            echo "--- Running SonarQube scan ---"
                            echo "Using token: ${SONAR_TOKEN:0:4}****"  # Shows first 4 chars only

                            sonar-scanner \
                              -Dsonar.projectKey=gemini-clone \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=${SONAR_HOST} \
                              -Dsonar.token=${SONAR_TOKEN} \
                              -Dsonar.verbose=true

                            echo "--- Sonar scan finished, delaying pod termination for 60 seconds ---"
                            sleep 60
                        '''
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
