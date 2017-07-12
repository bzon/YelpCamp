env.OC_DOWNLOAD_URL = "https://github.com/openshift/origin/releases/download/v1.5.1/openshift-origin-client-tools-v1.5.1-7b451fc-linux-64bit.tar.gz"
env.OC_BINARY = "openshift-origin-client-tools-v1.5.1-7b451fc-linux-64bit.tar.gz"
env.OSE_MASTER = "https://ec2-13-228-133-252.ap-southeast-1.compute.amazonaws.com:8443"
env.NODE_HOME = '/opt/nodejs'

node ("docker") {

    prepare()

    // stage "Build Dependency"

    //     git 'https://github.com/bzon/YelpCamp'
    //     sh '''#!/bin/bash -e
    //     PATH=${PATH}:${NODE_HOME}/bin
    //     npm install -g gulp-cli
    //     npm install
    //     '''

    // stage "Static Code Analysis"
    //     sh '''#!/bin/bash -ex
    //     PATH=${PATH}:${NODE_HOME}/bin
    //     gulp sonarqube --sonarHostUrl http://sonar:9000/sonar --sonarAnalysisMode publish --sonarProjectVersion build-${BUILD_NUMBER} --sonarProjectName "NodeJS Yelp Camp" --sonarSources "models,middleware,routes" --sonarLoginToken adopadmin --sonarPassword Adopadmin123
    //     '''

    stage "Docker Build"
        sh '''#!/bin/bash -ex
        oc project yelp-camp-dev
        oc start-build node-yelp-camp
        oc logs -f bc/node-yelp-camp
        '''

    stage "Deploy to Dev"
        sh "oc rollout latest node-yelp-camp"
        verifyDeployment()

    stage "Regression Test"

		git 'https://github.com/bzon/YelpCampTesting'
		sh "oc project devops-services"
		sh '''#!/bin/bash -e
		FITNESSE_POD=$(oc get pods | grep fitnesse | grep -Ev "build|deploy" | awk '{print $1}')
		oc exec $FITNESSE_POD -- mkdir -p /var/fitnesse_home/FitNesseRoot/YelpCampTesting
		pwd
		ls -lrt
		oc rsync ./ $FITNESSE_POD:/var/fitnesse_home/FitNesseRoot/YelpCampTesting/
		oc exec $FITNESSE_POD -- java -jar fitnesse-standalone.jar -c ".YelpCampTesting?suite&format=text" | tee -a results.txt
		'''

		failCount = sh(script: "cat results.txt | grep \"^F \" results.txt | wc -l", returnStdout: true).trim()

		if (failCount > 0) {
			error "Regression Test Failure"
		}

    stage "Deploy to Staging"
        sh "oc project yelp-camp-staging"
        sh "oc rollout latest node-yelp-camp"
        verifyDeployment()

    stage 'Approval: deploy to prod?'
        timeout(time:1, unit:'DAYS') {
            input message:'Approve Deployment?', submitter: 'administrators'
        }

    stage "Deploy to Production"
        sh "oc project yelp-camp-prod"
        sh "oc rollout latest node-yelp-camp"
        verifyDeployment()
}

def prepare() {
    sh '''#!/bin/bash -ex
    if [[ ! -d ${NODE_HOME} ]]; then
        cd /opt && \
        wget "https://nodejs.org/dist/v7.10.0/node-v7.10.0-linux-x64.tar.gz" && \
        tar xzf node-v* && \
        rm -fr *.tar.gz && \
        mv $(ls | grep node) nodejs
    fi
    '''

	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'ose-admin-cred', passwordVariable: 'OSE_PASSWORD', usernameVariable: 'OSE_LOGIN']]) {
		sh '''#!/bin/bash -ex
		if [[ ! -f /usr/local/bin/oc ]]; then
			echo "oc command not installed."
			cd /opt
			# Delete any openshift related installer
			rm -fr openshift* /usr/local/bin/oc
			
			# Install openshift commandline
			wget ${OC_DOWNLOAD_URL}
			tar -xzf ${OC_BINARY}
			cd $(ls | grep openshift)
			ln -sv $(pwd)/oc /usr/local/bin/oc
		fi
		oc login -u $OSE_LOGIN -p $OSE_PASSWORD $OSE_MASTER --insecure-skip-tls-verify > /dev/null 2>&1
		oc policy add-role-to-user system:image-puller system:serviceaccount:yelp-camp-staging:default --namespace=yelp-camp-dev
		oc policy add-role-to-user system:image-puller system:serviceaccount:yelp-camp-prod:default --namespace=yelp-camp-dev
		'''
	}
}

def verifyDeployment() {
    sh '''#!/bin/bash -ex
	sleep 5
    POD_NAME=$(oc get pods | grep node-yelp-camp | grep -Ev "deploy|build" | tail -1 | awk '{print $1}')
    until [[ $(oc get pod $POD_NAME | awk '{print $2}' | grep "1/1" | wc -l | tr -d ' ') -eq 1 ]]; do echo "waiting for the new deployment $POD_NAME to be completed.."; sleep 3; done
    '''
}
