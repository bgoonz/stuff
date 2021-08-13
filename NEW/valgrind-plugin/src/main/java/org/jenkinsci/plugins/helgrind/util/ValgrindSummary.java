package org.jenkinsci.plugins.helgrind.util;

import org.jenkinsci.plugins.helgrind.ValgrindResult;

public class ValgrindSummary
{
	/**
	 * Creates an HTML valgrind summary.
	 * 
	 * @param result
	 *            the valgrind result object
	 * @return the HTML fragment representing the valgrind report summary
	 */
	public static String createReportSummary(ValgrindResult result)
	{

		StringBuilder summary = new StringBuilder();
		int errorCount = result.getReport().getErrorList().getErrorCount();

		if (errorCount == 0)
		{
			summary.append("no errors");
		} 
		else
		{
			summary.append("<a href=\"helgrindResult\">");

			if (errorCount == 1)
				summary.append("one error, ");
			else
				summary.append(Integer.toString(errorCount) + " errors, ");

                        // Helgrind doesn't check if bytes leak.
			// summary.append(result.getReport().getErrorList().getDefinitelyLeakedBytes());
			// summary.append(" bytes definitely lost");
			
			summary.append("</a>");
		}

		return summary.toString();
	}
	
}
