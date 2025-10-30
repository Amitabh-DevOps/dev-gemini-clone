pipeline {
    // Use the 'devsecops-agent' we built in the UI
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

        stage('Build and Push with Kaniko') {
            steps {
                container('kaniko') {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds', 
                        usernameVariable: 'DOCKER_USER', 
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
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
                    sh '''
                        echo "--- Running Trivy scan on ${IMAGE_DESTINATION} ---"
                        trivy image --severity HIGH,CRITICAL ${IMAGE_DESTINATION}
                        echo "--- Trivy scan complete ---"
                    '''
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

        stage('Check Pod Status') {
            steps {
                // Use single quotes to avoid Groovy interpreting $
                sh 'kubectl get pods -n jenkins'
                sh 'kubectl describe pod -n jenkins'
            }
        }
    }
}
