pipeline {
    agent {
        kubernetes {
            // Use pod template from the repo
            yamlFile 'pod-template.yaml'
            defaultContainer 'jnlp'
        }
    }

    environment {
        // SonarQube credential ID stored in Jenkins
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {

        stage('Clone Code') {
            steps {
                echo "--- Cloning source code ---"
                checkout([$class: 'GitSCM',
                          branches: [[name: '*/feat/kind']],
                          userRemoteConfigs: [[
                              url: 'https://github.com/harisamjad0158/dev-gemini-clone.git'
                          ]]
                ])
            }
        }

        stage('SonarQube Scan') {
            steps {
                container('sonar-scanner') {
                    echo "--- Running SonarQube Scanner ---"
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        sonar-scanner \
                            -Dsonar.projectKey=gemini-clone \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                            -Dsonar.token=$SONAR_TOKEN \
                            -Dsonar.verbose=true
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
