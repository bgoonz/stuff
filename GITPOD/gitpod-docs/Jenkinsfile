podTemplate(
    label: 'agent',
    cloud: 'kubernetes',
    nodeSelector: 'gitpod.io/jenkins_agents=true',
    containers: [
        containerTemplate(
            name: 'mdbook',
            // Dockerfile: https://github.com/TypeFox/gitpod/blob/build/devops/dev-environment/Dockerfile
            // Registry: https://console.cloud.google.com/gcr/images/gitpod-dev/EU/dev-environment?project=gitpod-dev
            image: 'hrektts/mdbook',
            ttyEnabled: true,
            privileged: false,
            alwaysPullImage: true,
            workingDir: '/home/jenkins',
            resourceRequestCpu: '100m',
            resourceLimitCpu: '1000m',
            resourceRequestMemory: '100Mi',
            resourceLimitMemory: '1000Mi',
        ),
        containerTemplate(
            name: 'devenv',
            // Dockerfile: https://github.com/TypeFox/gitpod/blob/build/devops/dev-environment/Dockerfile
            // Registry: https://console.cloud.google.com/gcr/images/gitpod-dev/EU/dev-environment?project=gitpod-dev
            image: 'eu.gcr.io/gitpod-dev/dev-environment:latest',
            ttyEnabled: true,
            privileged: false,
            alwaysPullImage: true,
            workingDir: '/home/jenkins',
            resourceRequestCpu: '100m',
            resourceLimitCpu: '1000m',
            resourceRequestMemory: '100Mi',
            resourceLimitMemory: '1000Mi',
        )
    ]
) {
    node('agent') {
        checkout scm

        container('mdbook') {
            stage("mdbook") {
                    sh("mdbook build")
                    sh("cp -r src/* site/doc/")
                    sh("./redirect.sh")
                    archiveArtifacts(artifacts: 'site/**/*')
            }
            stage('check') {
                    sh("mdbook test")
            }
        }
        container('devenv') {
            if(env.BRANCH_NAME == "master") {
                stage("gcloud") {
                    withCredentials([file(credentialsId: 'gitpod-publish-static-web-pages', variable: 'gkey')]) {
                        sh('gcloud auth activate-service-account --key-file=${gkey}')
                    }
                    sh("gcloud config set project gitpod-191109")
                    sh("gsutil -m rsync -d -r ./site/doc/ gs://docs-gitpod-io/")
                    sh("gsutil -m acl ch -r -u AllUsers:R gs://docs-gitpod-io/")
                }
            }
        }
    }
}