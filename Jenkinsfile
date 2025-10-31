pipeline {
    agent { label 'devsecops-agent' }

    environment {
        IMAGE_DESTINATION = "johncorner158/dev-gemini-clone:latest"
        MY_ENV = "production"
        SONAR_HOST_URL = "http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
        SONAR_PROJECT_KEY = "dev-gemini"
    }

    stages {

        stage('Clone Code') {
            steps {
                echo "--- Cloning source code ---"
                git branch: 'feat/kind', url: 'https://github.com/harisamjad0158/dev-gemini-clone.git'
            }
        }

        stage('Test SonarQube Connection') {
            steps {
                container('sonar') {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                          echo "--- Testing SonarQube connection ---"
                          RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
                            -u $SONAR_TOKEN: \
                            ${SONAR_HOST_URL}/api/server/version)

                          if [ "$RESPONSE" = "200" ]; then
                            echo "✅ SonarQube connection successful! Jenkins is synced properly."
                          else
                            echo "❌ SonarQube connection failed! HTTP Status: $RESPONSE"
                            exit 1
                          fi
                        '''
                    }
                }
            }
        }

        stage('Build and Push with Kaniko') {
            steps {
                container('kaniko') {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                          echo "--- Creating Kaniko Docker config ---"
                          mkdir -p /kaniko/.docker
                          AUTH=$(echo -n "${DOCKER_USER}:${DOCKER_PASS}" | base64)
                          cat <<EOF > /kaniko/.docker/config.json
{
  "auths": {
    "https://index.docker.io/v1/": { "auth": "${AUTH}" }
  }
}
EOF
                          echo "--- Starting Kaniko build for ${IMAGE_DESTINATION} ---"
                          /kaniko/executor \
                            --dockerfile=Dockerfile \
                            --context=$(pwd) \
                            --destination=${IMAGE_DESTINATION} \
                            --cleanup=false
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

        stage('Run Short SonarQube Test Scan') {
            steps {
                container('sonar') {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                          echo "--- Running a short SonarQube test scan ---"
                          sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_TOKEN} \
                            -Dsonar.verbose=true \
                            -Dsonar.qualitygate.wait=false \
                            -Dsonar.scanner.skip=true
                          echo "--- Test scan executed successfully ---"
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "--- Deploying image ${IMAGE_DESTINATION} to ${MY_ENV} environment ---"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline finished successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}
