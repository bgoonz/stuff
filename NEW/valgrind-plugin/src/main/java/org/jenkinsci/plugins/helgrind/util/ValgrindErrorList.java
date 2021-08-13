package org.jenkinsci.plugins.helgrind.util;

import java.util.ArrayList;
import java.util.List;

import org.jenkinsci.plugins.helgrind.model.ValgrindError;
import org.jenkinsci.plugins.helgrind.model.ValgrindErrorKind;
import org.jenkinsci.plugins.helgrind.util.ValgrindLogger;

public class ValgrindErrorList
{
	private List<ValgrindError> errors;
	
	public ValgrindErrorList(List<ValgrindError> errors)
	{
		this.errors = errors;
	}
	
	public int getOverlapErrorCount()
	{		
		return getErrorCountByKind(ValgrindErrorKind.Overlap);
	}

	public List<ValgrindError> getOverlapErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.Overlap );
	}	
		
	public int getSyscallParamErrorCount()
	{		
		return getErrorCountByKind(ValgrindErrorKind.SyscallParam);
	}

	public List<ValgrindError> getSyscallParamErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.SyscallParam );
	}	
	
	public int getInvalidFreeErrorCount()
	{		
		return getErrorCountByKind(ValgrindErrorKind.InvalidFree);
	}

	public List<ValgrindError> getInvalidFreeErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.InvalidFree );
	}	
	
	public int getMismatchedFreeErrorCount()
	{		
		return getErrorCountByKind(ValgrindErrorKind.MismatchedFree);
	}

	public List<ValgrindError> getMismatchedFreeErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.MismatchedFree );
	}	
	
	public int getUninitializedValueErrorCount()
	{		
		return getErrorCountByKind(ValgrindErrorKind.UninitValue);
	}	
	
	public List<ValgrindError> getUninitializedValueErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.UninitValue );
	}	
	
	public int getUninitializedConditionErrorCount()
	{		
		return getErrorCountByKind(ValgrindErrorKind.UninitCondition);
	}	
	
	public List<ValgrindError> getUninitializedConditionErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.UninitCondition );
	}	
	
	public int getInvalidReadErrorCount()
	{		
		return getErrorCountByKind(ValgrindErrorKind.InvalidRead);
	}

	public List<ValgrindError> getInvalidReadErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.InvalidRead );
	}
	
	public int getRaceErrorCount()  // rrh helgrind
	{		
		return getErrorCountByKind(ValgrindErrorKind.Race);
	}

	public List<ValgrindError> getRaceErrors()  // rrh helgrind
	{
              List<ValgrindError> errors;
              errors = getErrorsByKind( ValgrindErrorKind.Race );
              return errors;
	}

	public int getInvalidWriteErrorCount()
	{
		return getErrorCountByKind(ValgrindErrorKind.InvalidWrite);
	}
	
	public List<ValgrindError> getInvalidWriteErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.InvalidWrite );
	}
	
	public int getLeakDefinitelyLostErrorCount()
	{
		return getErrorCountByKind(ValgrindErrorKind.Leak_DefinitelyLost);
	}
	
	public List<ValgrindError> getLeakDefinitelyLostErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.Leak_DefinitelyLost );
	}
	
	public int getLeakPossiblyLostErrorCount()
	{
		return getErrorCountByKind(ValgrindErrorKind.Leak_PossiblyLost);
	}
	
	public List<ValgrindError> getLeakPossiblyLostErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.Leak_PossiblyLost );
	}
	
	public int getLeakStillReachableErrorCount()
	{
		return getErrorCountByKind(ValgrindErrorKind.Leak_StillReachable);
	}
	
	public List<ValgrindError> getLeakStillReachableErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.Leak_StillReachable );
	}
	
	public int getLeakIndirectlyLostErrorCount()
	{
		return getErrorCountByKind(ValgrindErrorKind.Leak_IndirectlyLost);
	}
	
	public List<ValgrindError> getLeakIndirectlyLostErrors()
	{
		return getErrorsByKind( ValgrindErrorKind.Leak_IndirectlyLost );
	}

	public int getErrorCount()
	{
		if ( errors == null )
			return 0;
		
		return errors.size();
	}
	
	public int getErrorCountByKind( ValgrindErrorKind valgrindErrorKind )
	{
		if ( errors == null )
			return 0;
		
		int count = 0;
		for ( ValgrindError error: errors )
		{
			if ( error.getKind() == null )
				continue;
			
			if ( error.getKind().equals( valgrindErrorKind ) )
				count++;
		}
		
		return count;
	}	
	
	public List<ValgrindError> getErrorsByKind( ValgrindErrorKind valgrindErrorKind )
	{
		if ( errors == null || errors.isEmpty() )
			return null;
		
		List<ValgrindError> result = new ArrayList<ValgrindError>();
		
		for ( ValgrindError error: errors )
			if ( error.getKind().equals( valgrindErrorKind ) )
				result.add( error );
		
		if ( result.isEmpty() )
			return null;
		
		return result;		
	}	

	public int getDefinitelyLeakedBytes()
	{
		if ( errors == null )
			return 0;
		
		int bytes = 0;
		
		for ( ValgrindError error : errors )
		{
			if ( error.getKind() != ValgrindErrorKind.Leak_DefinitelyLost )
				continue;
			
			if ( error.getLeakedBytes() == null )
				continue;
			
			bytes += error.getLeakedBytes().intValue();
		}
		
		return bytes;
	}
	
	public int getPossiblyLeakedBytes()
	{
		if ( errors == null )
			return 0;
		
		int bytes = 0;
		
		for ( ValgrindError error : errors )
		{
			if ( error.getKind() != ValgrindErrorKind.Leak_PossiblyLost )
				continue;
			
			if ( error.getLeakedBytes() == null )
				continue;
			
			bytes += error.getLeakedBytes().intValue();
		}
		
		return bytes;
	}
	
	public int getLeakedBytes( ValgrindErrorKind kind, String executable )
	{
		if ( errors == null )
			return 0;
		
		int bytes = 0;
		
		for ( ValgrindError error : errors )
		{
			if ( error.getKind() != kind )
				continue;
			
			if ( !error.getExecutable().equals(executable) )
				continue;			
			
			if ( error.getLeakedBytes() == null )
				continue;
			
			bytes += error.getLeakedBytes().intValue();
		}
		
		return bytes;
	}

	public int getRaces( ValgrindErrorKind kind, String executable )  // rrh helgrind
        {
		if ( errors == null )
			return 0;
		
		int races = 0;
		
		for ( ValgrindError error : errors )
		{
			if ( error.getKind() != kind )
				continue;
			
			if ( !error.getExecutable().equals(executable) )
				continue;			
			
			if ( error.getLeakedBytes() == null )
				continue;
			
			races += error.getRaces().intValue();
		}
		
		return races;
    }

}
