pipeline {
    agent { label 'devsecops-agent' }

    environment {
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
                          echo "--- Testing SonarQube Connection ---"
                          response=$(curl -s -o /dev/null -w "%{http_code}" \
                            -u ${SONAR_TOKEN}: \
                            ${SONAR_HOST_URL}/api/server/version)

                          if [ "$response" = "200" ]; then
                            echo "✅ SonarQube connection successful!"
                          else
                            echo "❌ SonarQube connection failed with HTTP code $response"
                            exit 1
                          fi
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Jenkins and SonarQube are successfully synced!"
        }
        failure {
            echo "❌ Jenkins could not connect to SonarQube. Check token or URL."
        }
    }
}
