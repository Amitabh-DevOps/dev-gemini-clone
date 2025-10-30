pipeline {
    // We are still using our powerful 'devsecops-agent'
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
                git url: 'https://github.com/harisamjad0158/dev-gemini-clone.git', branch: 'feat/kind'
            }
        }

        // 1. NEW STAGE: We scan the code *before* we build it.
        stage('Scan with SonarQube') {
            // 2. We run this step inside the 'sonar-scanner' container
            container('sonar-scanner') {
                steps {
                    sh """
                      echo "--- Running SonarQube scan ---"
                      
                      # This is the command to run the scanner.
                      # It needs a server URL and a token, which we haven't set up yet.
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

        stage('Build and Push with Kaniko') {
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
            container('trivy') {
                steps {
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
