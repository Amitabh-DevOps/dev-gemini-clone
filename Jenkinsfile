@Library('shared') _

pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'devshubh2204/geminiclonenip'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        GITHUB_CREDENTIALS = credentials('git-hub-cred')
        GIT_BRANCH = "dev-shubh"
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                script {
                    clean_ws()
                }
            }
        }

        stage('Clone Repository') {
            steps {
                script {
                    clone("https://github.com/AWS-DevOps-shubh/dev-gemini-clone.git", "dev-shubh")
                }
            }
        }

        stage('Build and Scan Docker Image') {
            parallel {
                stage('Build Main App Image') {
                    steps {
                        script {
                            docker_build(
                                imageName: env.DOCKER_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                dockerfile: 'Dockerfile',
                                context: '.'
                            )
                        }
                    }
                }

                stage('Security Scan with Trivy') {
                    steps {
                        script {
                            trivy()
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    docker_push(
                        imageName: env.DOCKER_IMAGE_NAME,
                        imageTag: env.DOCKER_IMAGE_TAG,
                        credentials: 'docker-hub-cred'
                    )
                }
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    updatek8s(
                        imageTag: env.DOCKER_IMAGE_TAG,
                        manifestsPath: 'kubernetes',
                        gitCredentials: 'git-hub-cred',
                        gitUserName: 'AWS-DevOps-shubh',
                        gitUserEmail: 'devshubh2204@gmail.com',
                    )
                }
            }
        }
    }
}
