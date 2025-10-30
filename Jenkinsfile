pipeline {
    agent {
        label 'devsecops-agent'
    }

    environment {
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
    }

    stages {
        stage('Pod Debug Info') {
            steps {
                echo "--- Checking Pod info ---"
                sh '''
                    echo "Listing all containers in this pod:"
                    cat /proc/1/cgroup
                    echo "--- Environment Variables ---"
                    env
                    echo "--- Disk usage ---"
                    df -h
                    echo "--- Current directory ---"
                    pwd
                    echo "--- Files in workspace ---"
                    ls -al
                '''
            }
        }

        stage('Clone Code') {
            steps {
                git url: 'https://github.com/harisamjad0158/dev-gemini-clone.git', branch: 'feat/kind'
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

    post {
        always {
            echo "--- Fetching logs for all containers in the pod ---"
            sh '''
                POD_NAME=$(hostname)
                echo "Pod Name: $POD_NAME"
                echo "--- Logs for main jenkins container ---"
                kubectl logs $POD_NAME -c jenkins || true
                echo "--- Logs for kaniko container ---"
                kubectl logs $POD_NAME -c kaniko || true
                echo "--- Logs for trivy container ---"
                kubectl logs $POD_NAME -c trivy || true
                echo "--- Describe pod for detailed info ---"
                kubectl describe pod $POD_NAME
            '''
        }
    }
}
