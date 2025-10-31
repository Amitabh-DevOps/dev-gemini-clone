pipeline {
    agent {
        kubernetes {
            label 'devsecops-agent'
            defaultContainer 'jnlp'
            yamlFile 'pod-template.yaml'  // Make sure this file exists in your repo
        }
    }

    environment {
        SONAR_TOKEN = credentials('jenkins-token1')  // Sonar token stored in Jenkins credentials
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo '--- Cloning source code ---'
                git url: 'https://github.com/harisamjad0158/dev-gemini-clone.git', branch: 'feat/kind'
            }
        }

        stage('SonarQube Scan') {
            steps {
                container('sonar-scanner') {
                    echo '--- Running SonarQube scan ---'
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=gemini-clone \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                        -Dsonar.login=$SONAR_TOKEN \
                        -Dsonar.verbose=true
                    '''
                }
            }
        }

        stage('Build and Push with Kaniko') {
            steps {
                container('kaniko') {
                    echo '--- Building Docker image with Kaniko ---'
                    sh '''
                        /kaniko/executor \
                        --dockerfile=Dockerfile \
                        --context=dir://. \
                        --destination=your-docker-repo/gemini-clone:latest \
                        --insecure
                    '''
                }
            }
        }

        stage('Scan Image with Trivy') {
            steps {
                container('trivy') {
                    echo '--- Scanning Docker image with Trivy ---'
                    sh 'trivy image your-docker-repo/gemini-clone:latest'
                }
            }
        }

        stage('Test') {
            steps {
                echo '--- Running tests ---'
                sh 'echo "Implement your tests here"'
            }
        }

        stage('Deploy') {
            steps {
                echo '--- Deploying application ---'
                sh 'echo "Implement your deployment here"'
            }
        }

        stage('Debug Delay') {
            steps {
                echo '--- Waiting 1 minute for pod logs inspection ---'
                sh 'sleep 60'
            }
        }

    }

    post {
        always {
            echo '--- Pipeline finished ---'
        }
        success {
            echo '--- Pipeline succeeded ---'
        }
        failure {
            echo '--- Pipeline failed ---'
        }
    }
}
