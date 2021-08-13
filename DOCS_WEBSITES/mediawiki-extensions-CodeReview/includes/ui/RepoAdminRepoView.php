<?php

/**
 * View for editing a single repository
 */
class RepoAdminRepoView {
	/**
	 * Reference to Special:RepoAdmin
	 * @var Title
	 */
	private $title;

	/**
	 * Human-readable name of the repository
	 * @var string
	 */
	private $repoName;

	/**
	 * Actual repository object
	 */
	private $repo;

	/**
	 * @param Title $t Special page title (with repo subpage)
	 * @param string $repo
	 */
	public function __construct( Title $t, $repo ) {
		$this->title = $t;
		$this->repoName = $repo;
		$this->repo = CodeRepository::newFromName( $repo );
	}

	public function execute() {
		global $wgOut, $wgRequest;
		$repoExists = (bool)$this->repo;
		$user = $this->getUser();
		$repoPath = $wgRequest->getVal( 'wpRepoPath', $repoExists ? $this->repo->getPath() : '' );
		$bugPath = $wgRequest->getVal( 'wpBugPath',
			$repoExists ? $this->repo->getBugzillaBase() : '' );
		$viewPath = $wgRequest->getVal( 'wpViewPath',
			$repoExists ? $this->repo->getViewVcBase() : '' );
		if ( $wgRequest->wasPosted()
			&& $user->matchEditToken( $wgRequest->getVal( 'wpEditToken' ), $this->repoName )
		) {
			// @todo log
			$dbw = wfGetDB( DB_PRIMARY );
			if ( $repoExists ) {
				$dbw->update(
					'code_repo',
					[
						'repo_path' => $repoPath,
						'repo_viewvc' => $viewPath,
						'repo_bugzilla' => $bugPath
					],
					[ 'repo_id' => $this->repo->getId() ],
					__METHOD__
				);
			} else {
				$dbw->insert(
					'code_repo',
					[
						'repo_name' => $this->repoName,
						'repo_path' => $repoPath,
						'repo_viewvc' => $viewPath,
						'repo_bugzilla' => $bugPath
					],
					__METHOD__
				);
			}
			$wgOut->wrapWikiMsg( '<div class="successbox">$1</div>',
				[ 'repoadmin-edit-sucess', $this->repoName ] );
			return;
		}
		$formDescriptor = [
			'repoadmin-edit-path' => [
				'type' => 'text',
				'name' => 'wpRepoPath',
				'size' => 60,
				'default' => $repoPath,
				'dir' => 'ltr',
				'label-message' => 'repoadmin-edit-path'
			],
			'repoadmin-edit-bug' => [
				'type' => 'text',
				'name' => 'wpBugPath',
				'size' => 60,
				'default' => $bugPath,
				'dir' => 'ltr',
				'label-message' => 'repoadmin-edit-bug'
			],
			'repoadmin-edit-view' => [
				'type' => 'text',
				'name' => 'wpViewPath',
				'size' => 60,
				'default' => $viewPath,
				'dir' => 'ltr',
				'label-message' => 'repoadmin-edit-view'
			]
		];

		$htmlForm = HTMLForm::factory( 'ooui', $formDescriptor, $wgOut->getContext() );
		$htmlForm
			->addHiddenField( 'wpEditToken', $user->getEditToken( $this->repoName ) )
			->setAction( $this->title->getLocalURL() )
			->setMethod( 'post' )
			->setSubmitTextMsg( 'repoadmin-edit-button' )
			->setWrapperLegend( wfMessage( 'repoadmin-edit-legend', $this->repoName )->text() )
			->prepareForm()
			->displayForm( false );
	}
}
