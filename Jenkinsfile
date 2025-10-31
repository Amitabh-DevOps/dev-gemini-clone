pipeline {
    agent {
        kubernetes {
            label 'devsecops-agent'
            defaultContainer 'jnlp'
            yamlFile 'pod-template.yaml'  // Your pod template file in workspace
        }
    }

    environment {
        SONAR_HOST_URL = 'http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000'
    }

    stages {
        stage('Clone Code') {
            steps {
                echo '--- Cloning source code ---'
                checkout scm
            }
        }

        stage('SonarQube Scan') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey=gemini-clone \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=$SONAR_HOST_URL \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.verbose=true
                        '''
                    }
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                container('trivy') {
                    sh 'trivy fs --exit-code 1 --severity HIGH,CRITICAL .'
                }
            }
        }

        stage('Build with Kaniko') {
            steps {
                container('kaniko') {
                    sh '''
                        /kaniko/executor \
                            --context $WORKSPACE \
                            --dockerfile $WORKSPACE/Dockerfile \
                            --destination your-dockerhub-user/gemini-clone:latest \
                            --cache=true
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline finished successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
