pipeline {
    agent {
        kubernetes {
            label 'devsecops-agent'
            defaultContainer 'jnlp'
            yamlFile 'path/to/your/pod-template.yaml'
        }
    }
    environment {
        SONAR_HOST = 'http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000'
    }
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/harisamjad0158/dev-gemini-clone.git'
            }
        }
        stage('SonarQube Scan') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'jenkins-token1', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        echo "--- Running SonarQube scan ---"
                        sonar-scanner \
                          -Dsonar.projectKey=gemini-clone \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=${SONAR_HOST} \
                          -Dsonar.token=${SONAR_TOKEN} \
                          -Dsonar.verbose=true

                        echo "--- Scan finished, delaying pod termination for 60 seconds ---"
                        sleep 60
                        '''
                    }
                }
            }
        }
        stage('Other Stages') {
            steps {
                echo "Next stages..."
            }
        }
    }
}
