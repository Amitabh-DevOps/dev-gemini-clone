podTemplate(yamlFile: 'pod-template.yaml') {
    node(POD_LABEL) {

        stage('Clone Code') {
            echo '--- Cloning source code ---'
            checkout scm
        }

        stage('SonarQube Scan') {
            container('sonar-scanner') {
                withCredentials([string(credentialsId: 'jenkins-token1', variable: 'SONAR_TOKEN')]) {
                    sh """
                        echo '--- Running SonarQube scan ---'
                        sonar-scanner \
                        -Dsonar.projectKey=gemini-clone \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                        -Dsonar.token=$SONAR_TOKEN \
                        -Dsonar.verbose=true
                    """
                }
            }
        }

        stage('Debug Delay') {
            echo 'Sleeping 60 seconds to keep devsecops-agent pod alive for logs...'
            sleep 60
        }

        stage('Build and Push with Kaniko') {
            container('kaniko') {
                sh 'echo "Build step goes here"'
            }
        }

        stage('Scan Image with Trivy') {
            container('trivy') {
                sh 'echo "Trivy scan goes here"'
            }
        }

        stage('Test') {
            sh 'echo "Test stage"'
        }

        stage('Deploy') {
            sh 'echo "Deploy stage"'
        }
    }
}
