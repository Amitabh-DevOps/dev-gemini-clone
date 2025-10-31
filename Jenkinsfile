podTemplate(
    label: 'devsecops-agent',
    containers: [
        containerTemplate(
            name: 'jnlp',
            image: 'jenkins/inbound-agent:alpine',
            command: 'cat',
            ttyEnabled: true
        ),
        containerTemplate(
            name: 'sonar-scanner',
            image: 'sonarsource/sonar-scanner-cli:latest',
            command: 'cat',
            ttyEnabled: true
        ),
        containerTemplate(
            name: 'kaniko',
            image: 'gcr.io/kaniko-project/executor:debug',
            command: 'cat',
            ttyEnabled: true
        ),
        containerTemplate(
            name: 'trivy',
            image: 'aquasec/trivy:latest',
            command: 'cat',
            ttyEnabled: true
        )
    ],
    volumes: [
        emptyDirVolume(mountPath: '/home/jenkins/agent', memory: false)
    ],
    idleMinutes: 1   // Keep pod alive for 1 minute after job completion
) {
    node('devsecops-agent') {

        stage('Clone Code') {
            echo "--- Cloning source code ---"
            checkout scm
        }

        stage('SonarQube Scan') {
            container('sonar-scanner') {
                withCredentials([string(credentialsId: 'jenkins-token1', variable: 'SONAR_TOKEN')]) {
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

        stage('Build with Kaniko') {
            container('kaniko') {
                echo "--- Running Kaniko build ---"
                sh 'echo "Kaniko build placeholder"'
            }
        }

        stage('Security Scan with Trivy') {
            container('trivy') {
                echo "--- Running Trivy scan ---"
                sh 'echo "Trivy scan placeholder"'
            }
        }

        stage('Post Actions') {
            echo "--- Pipeline finished ---"
        }
    }
}
