<?php

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

class CodeReviewShowEmails extends Maintenance {
	private $EmailData = [
		'author'  => 'Author',
		'repo'    => 'Repository',
		'rev'     => 'r88888',
		'URL'     => 'http://www.example.org/CR/repo/r88888',
		'prevrev' => 'r52100',
		'prevURL'     => 'http://www.example.org/CR/repo/r52100',
		'summary' => 'This is a patch to fix a nasty bug
This is not the best commit summary but should be enough to:
* display something
* get a rough idea of message formatting
* some other thing
Follow up r52100
',
		'follow-up-summary' => 'Fix up r52100',
		'comment' => 'My comment is that this revision is obviously wrong.
You missed a lot of points there and need to revert or fix your code
',
		'oldstatus' => 'new',
		'newstatus' => 'fixme',
	];

	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Show example emails for CodeReview' );

		$this->requireExtension( 'CodeReview' );
	}

	public function execute() {
		$this->printSubject( '' );
		print wfMessage( 'codereview-email-body',
			$this->EmailData['author'],
			$this->EmailData['URL'],
			$this->EmailData['rev'],
			$this->EmailData['comment'],
			$this->EmailData['summary']
		)->text() . "\n";
		$this->printRule();

		$this->printSubject( 2 );
		print wfMessage( 'codereview-email-body2',
			$this->EmailData['author'],
			$this->EmailData['prevrev'],
			$this->EmailData['URL'],
			$this->EmailData['follow-up-summary'],
			$this->EmailData['prevURL'],
			$this->EmailData['summary']
		)->text() . "\n";
		$this->printRule();

		$this->printSubject( 3 );
		print wfMessage( 'codereview-email-body3',
			$this->EmailData['author'],
			$this->EmailData['rev'],
			$this->EmailData['oldstatus'],
			$this->EmailData['newstatus'],
			$this->EmailData['URL'],
			$this->EmailData['summary']
		)->text() . "\n";
		$this->printRule();

		$this->printSubject( 4 );
		print wfMessage( 'codereview-email-body4',
			$this->EmailData['author'],
			$this->EmailData['rev'],
			$this->EmailData['oldstatus'],
			$this->EmailData['newstatus'],
			$this->EmailData['URL'],
			$this->EmailData['summary'],
			$this->EmailData['follow-up-summary']
		)->text() . "\n";
		$this->printRule();
	}

	/**
	 * Print the subject line.
	 * @param string|int $type Either '', 2, 3 or 4
	 */
	private function printSubject( $type ) {
		$repo = $this->EmailData['repo'];
		if ( $type == 2 ) {
			$rev = $this->EmailData['prevrev'];
		} else {
			$rev = $this->EmailData['rev'];
		}
		printf( "Subject: %s\n\n",
			wfMessage( 'codereview-email-subj' . $type,
				$repo,
				$rev
			)->text()
		);
	}

	private function printRule() {
		print "===============================================\n";
	}
}

$maintClass = CodeReviewShowEmails::class;
require_once RUN_MAINTENANCE_IF_MAIN;
