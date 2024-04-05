pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "rohankp/hotel-booking-system-backend"
        CONTAINER_NAME = "hotel-booking-system-backend-container"
        REGISTRY = ""
        REGISTRY_CREDENTIALS_ID = "dockerhub-credentials"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${env.BUILD_ID}")
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    docker.run("--rm ${DOCKER_IMAGE}:${env.BUILD_ID} npm test")
                }
            }
        }

        stage('Push') {
            steps {
                script {
                    docker.withRegistry(REGISTRY, REGISTRY_CREDENTIALS_ID) {
                        docker.image("${DOCKER_IMAGE}:${env.BUILD_ID}").push()
                        docker.image("${DOCKER_IMAGE}:${env.BUILD_ID}").tag('latest')
                        docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"

                    docker.run("-d --name ${CONTAINER_NAME} -p 3000:3000 ${DOCKER_IMAGE}:latest")
                }
            }
        }
    }

    post {
        always {
            script {
                sh "docker rmi \$(docker images -q ${DOCKER_IMAGE}:${env.BUILD_ID}) || true"
                sh "docker rmi \$(docker images -q ${DOCKER_IMAGE}:latest) || true"
            }
        }
    }
}