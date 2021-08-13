<?php

/**
 * View for viewing all of the repositories
 */
class RepoAdminListView {
	/**
	 * Reference to Special:RepoAdmin
	 * @var Title
	 */
	private $title;

	/**
	 * @param Title $t Title object referring to Special:RepoAdmin
	 */
	public function __construct( Title $t ) {
		$this->title = $t;
	}

	/**
	 * Get "create new repo" form
	 * @param OutputPage $output
	 * @return string
	 */
	private function getForm( OutputPage $output ) {
		global $wgScript;

		$formDescriptor = [
			'repoadmin-label' => [
				'type' => 'text',
				'name' => 'repo',
				'label-message' => 'repoadmin-new-label',
				'id' => 'repo'
			]
		];

		$htmlForm = HTMLForm::factory( 'ooui', $formDescriptor, $output->getContext() );
		$htmlForm
			->addHiddenField( 'title', $this->title->getPrefixedDBKey() )
			->setAction( $wgScript )
			->setMethod( 'get' )
			->setSubmitTextMsg( 'repoadmin-new-button' )
			->setWrapperLegendMsg( 'repoadmin-new-legend' )
			->prepareForm()
			->displayForm( false );

		return true;
	}

	public function execute() {
		global $wgOut;

		// Todo inject instead of accessing the global
		$output = $wgOut;

		$this->getForm( $output );
		$repos = CodeRepository::getRepoList();
		if ( !count( $repos ) ) {
			return;
		}
		$text = '';
		foreach ( $repos as $repo ) {
			$name = $repo->getName();
			$text .= "* [[Special:RepoAdmin/$name|$name]]\n";
		}
		$output->addWikiTextAsInterface( $text );
	}
}
