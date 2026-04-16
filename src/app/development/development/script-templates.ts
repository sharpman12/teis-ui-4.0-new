export class ScriptTemplates {
    // Base code
    public static baseScript = `Option Explicit

Sub Main
        
End Sub
    `;

    // Standard template for new process script
    public static processScript = `' ==============================================================================================
' Template/Script name: <Name of Script>
'
' Required TEIS version:
'
' Required System libraries:
'   - SysLibLog
'
' Required Third-Party Objects:
'   - ThirdPartyObjectName, ex Chilkat 9.5.0.90 ->
'
' Description:
'   <Description of the purpose and functionality of the script>
'
' Version information:
'   Version Date            Changed By          Description
'   1.0.0   <YYYY-MM-DD>    <Name of developer> <Comment about changes made, or "First version" for version "1.0.0">
' ==============================================================================================

Option Explicit

Type TeisParameters
	' TEIS parameters
	KeepTraceFiles              As Boolean  ' Only for debug purpose, keep tempfile after task end (should NOT be True at normal run)
	SetMessagePendingTimeOut    As Long     ' Set by script. Sets wait response

	' Script specific parameters

End Type

Dim Parameters As TeisParameters

Sub Main

	On Error GoTo ErrorHandling 'Turn on default error handling

	ReportLog(RL_NORMAL, "||Script starts")

	GetParameters(Parameters)

    With Parameters
    	If .SetMessagePendingTimeOut <> 1800 Then
    		SetMessagePendingDelay(.SetMessagePendingTimeOut)
    		ReportLog(RL_NORMAL, "||MessagePendingDelay set to = " & .SetMessagePendingTimeOut & " seconds")
    	End If
    
    	' Write the code here
    
    	ReportLog(RL_NORMAL, "||Script ends")
    End With

	End 'Terminates the entire script immediately, not just the current subroutine or function

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ReportErrors()
	Quit
End Sub

Sub GetParameters(Parameters As TeisParameters)

	On Error GoTo ErrorHandling 'Turn on default error handling

	With Parameters
		' TEIS parameters
		.SetMessagePendingTimeOut = CLng(GetParameter("-SetMessagePendingTimeOut", "1800"))   ' Maximum number of seconds until timeout is reached for the entire task. Default 1800 seconds

		If LogLevel = "Info" Then
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", False))
		Else
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", True))
			ReportLog(RL_NORMAL, "||LogLevel is: " & LogLevel)
		End If

		' Script specific parameters

	End With

	Exit Sub

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ErrorHandler("GetParameters@Main" & ", script: " & GetParameter("-ScriptName"))
End Sub
    `;

    // Standard template for new process template
    public static processTemplate = `' ==============================================================================================
' Template/Script name: <Name of Script>
'
' Required TEIS version:
'
' Required System libraries:
'   - SysLibLog
'
' Required Third-Party Objects:
'   - ThirdPartyObjectName, ex Chilkat 9.5.0.90 ->
'
' Description:
'   <Description of the purpose and functionality of the script>
'
' Version information:
'   Version Date            Changed By          Description
'   1.0.0   <YYYY-MM-DD>    <Name of developer> <Comment about changes made, or "First version" for version "1.0.0">
' ==============================================================================================

Option Explicit

Type TeisParameters
	' TEIS parameters
	KeepTraceFiles              As Boolean  ' Only for debug purpose, keep tempfile after task end (should NOT be True at normal run)
	SetMessagePendingTimeOut    As Long     ' Set by script. Sets wait response

	' Script specific parameters

End Type

Dim Parameters As TeisParameters

Sub Main

	On Error GoTo ErrorHandling 'Turn on default error handling

	ReportLog(RL_NORMAL, "||Script starts")

	GetParameters(Parameters)

    With Parameters
    	If .SetMessagePendingTimeOut <> 1800 Then
    		SetMessagePendingDelay(.SetMessagePendingTimeOut)
    		ReportLog(RL_NORMAL, "||MessagePendingDelay set to = " & .SetMessagePendingTimeOut & " seconds")
    	End If
    
    	' Write the code here
    
    	ReportLog(RL_NORMAL, "||Script ends")
    End With

	End 'Terminates the entire script immediately, not just the current subroutine or function

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ReportErrors()
	Quit
End Sub

Sub GetParameters(Parameters As TeisParameters)

	On Error GoTo ErrorHandling 'Turn on default error handling

	With Parameters
		' TEIS parameters
		.SetMessagePendingTimeOut = CLng(GetParameter("-SetMessagePendingTimeOut", "1800"))   ' Maximum number of seconds until timeout is reached for the entire task. Default 1800 seconds

		If LogLevel = "Info" Then
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", False))
		Else
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", True))
			ReportLog(RL_NORMAL, "||LogLevel is: " & LogLevel)
		End If

		' Script specific parameters

	End With

	Exit Sub

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ErrorHandler("GetParameters@Main" & ", script: " & GetParameter("-ScriptName"))
End Sub
    `;

    // Standard template for new trigger script
    public static triggerScript = `' ==============================================================================================
' Template/Script name: <Name of Script>
'
' Required TEIS version:
'
' Required System libraries:
'   - SysLibLog
'
' Required Third-Party Objects:
'   - ThirdPartyObjectName, ex Chilkat 9.5.0.90 ->
'
' Description:
'   <Description of the purpose and functionality of the script>
'
' Version information:
'   Version Date            Changed By          Description
'   1.0.0   <YYYY-MM-DD>    <Name of developer> <Comment about changes made, or "First version" for version "1.0.0">
' ==============================================================================================

Option Explicit

Type TeisParameters
	' TEIS parameters
	KeepTraceFiles              As Boolean  ' Only for debug purpose, keep tempfile after task end (should NOT be True at normal run)
	SetMessagePendingTimeOut    As Long     ' Set by script. Sets wait response
	' Script specific parameters

End Type

Type TeisConfigParameters
	' TEIS parameters

	' Script specific parameters

End Type

Dim Parameters          As TeisParameters
Dim ConfigParameters    As TeisConfigParameters

Sub Main

	On Error GoTo ErrorHandling 'Turn on default error handling

	ReportLog(RL_NORMAL, "||Script starts")

	GetParameters(  Parameters,         _
                    ConfigParameters    _
                    )

	If Parameters.SetMessagePendingTimeOut <> 1800 Then
		SetMessagePendingDelay(Parameters.SetMessagePendingTimeOut)
		ReportLog(RL_NORMAL, "||MessagePendingDelay set to = " & Parameters.SetMessagePendingTimeOut & " seconds")
	End If

	' Write the code here

	ReportLog(RL_NORMAL, "||Script ends")

	End 'Terminates the entire script immediately, not just the current subroutine or function

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ReportErrors()
	Quit
End Sub

Sub GetParameters(  Parameters          As TeisParameters,      _
                    ConfigParameters    As TeisConfigParameters _
                    )

	On Error GoTo ErrorHandling 'Turn on default error handling

	With Parameters
		' TEIS parameters
		.SetMessagePendingTimeOut   = CLng(GetParameter("-SetMessagePendingTimeOut", "1800"))   ' Maximum number of seconds until timeout is reached for the entire task. Default 1800 seconds

		If LogLevel = "Info" Then
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", False))
		Else
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", True))
			ReportLog(RL_NORMAL, "||LogLevel is: " & LogLevel)
		End If

		' Script specific parameters

	End With

	With ConfigParameters
		' TEIS parameters

		' Script specific parameters

	End With

	Exit Sub

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ErrorHandler("GetParameters@Main" & ", script: " & GetParameter("-ScriptName"))
End Sub
    `;

    // Standard template for new trigger template
    public static triggerTemplate = `' ==============================================================================================
' Template/Script name: <Name of Script>
'
' Required TEIS version:
'
' Required System libraries:
'   - SysLibLog
'
' Required Third-Party Objects:
'   - ThirdPartyObjectName, ex Chilkat 9.5.0.90 ->
'
' Description:
'   <Description of the purpose and functionality of the script>
'
' Version information:
'   Version Date            Changed By          Description
'   1.0.0   <YYYY-MM-DD>    <Name of developer> <Comment about changes made, or "First version" for version "1.0.0">
' ==============================================================================================

Option Explicit

Type TeisParameters
	' TEIS parameters
	KeepTraceFiles              As Boolean  ' Only for debug purpose, keep tempfile after task end (should NOT be True at normal run)
	SetMessagePendingTimeOut    As Long     ' Set by script. Sets wait response
	' Script specific parameters

End Type

Type TeisConfigParameters
	' TEIS parameters

	' Script specific parameters

End Type

Dim Parameters          As TeisParameters
Dim ConfigParameters    As TeisConfigParameters

Sub Main

	On Error GoTo ErrorHandling 'Turn on default error handling

	ReportLog(RL_NORMAL, "||Script starts")

	GetParameters(  Parameters,         _
                    ConfigParameters    _
                    )

	If Parameters.SetMessagePendingTimeOut <> 1800 Then
		SetMessagePendingDelay(Parameters.SetMessagePendingTimeOut)
		ReportLog(RL_NORMAL, "||MessagePendingDelay set to = " & Parameters.SetMessagePendingTimeOut & " seconds")
	End If

	' Write the code here

	ReportLog(RL_NORMAL, "||Script ends")

	End 'Terminates the entire script immediately, not just the current subroutine or function

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ReportErrors()
	Quit
End Sub

Sub GetParameters(  Parameters          As TeisParameters,      _
                    ConfigParameters    As TeisConfigParameters _
                    )

	On Error GoTo ErrorHandling 'Turn on default error handling

	With Parameters
		' TEIS parameters
		.SetMessagePendingTimeOut   = CLng(GetParameter("-SetMessagePendingTimeOut", "1800"))   ' Maximum number of seconds until timeout is reached for the entire task. Default 1800 seconds

		If LogLevel = "Info" Then
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", False))
		Else
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", True))
			ReportLog(RL_NORMAL, "||LogLevel is: " & LogLevel)
		End If

		' Script specific parameters

	End With

	With ConfigParameters
		' TEIS parameters

		' Script specific parameters

	End With

	Exit Sub

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ErrorHandler("GetParameters@Main" & ", script: " & GetParameter("-ScriptName"))
End Sub
    `;

    // Standard template for new TeisRs script
    public static teisRsScript = `' ==============================================================================================
' Template/Script name: <Name of Script - Recommended prefixing name with TeisRs>
'
' Requires TEIS WSF
'
' Required TEIS version:
'   - 3.3 SP3 and higher
'
' Required System libraries:
'   - SysLibLog
'   - ClassLib_TeisUtils
'
' Required Third-Party Objects
'   - Chilkat 9.5.0.90 ->
'
' Description:
'   ' <Description of the purpose and functionality of the TeisRs script>
'
' Version information:
'   Version Date            Changed By          Description
'   1.0.0   <YYYY-MM-DD>    <Name of developer> <Comment about changes made, or "First version" for version "1.0.0">
' ==============================================================================================

Option Explicit

Type TeisParameters
	' TEIS parameters
	KeepTraceFiles              As Boolean  ' Only for debug purpose, keep tempfile after task end (should NOT be True at normal run)
	SetMessagePendingTimeOut    As Long     ' Set by script. Sets wait response

	' Script specific parameters
	strContentType              As String
End Type

Dim Parameters As TeisParameters

Sub Main

	On Error GoTo ErrorHandling 'Turn on default error handling

	Dim oBase64             As New CL_Base64
	Dim oTeisRs             As New CL_TeisRS ' In ClassLib_TeisUtils
    Dim strInputFile        As String
	Dim strInData           As String
	Dim strInJson           As String
	Dim strResponseData     As String
	Dim iHttpResponseCode   As Integer

	ReportLog(RL_NORMAL,"||Script starts")

	GetParameters(Parameters)

    With Parameters
    	If .SetMessagePendingTimeOut <> 1800 Then
    		SetMessagePendingDelay(.SetMessagePendingTimeOut)
    		ReportLog(RL_NORMAL, "||MessagePendingDelay set to = " & .SetMessagePendingTimeOut & " seconds")
    	End If

        strInputFile = GetParameter("-InputFile")

        If strInputFile <> "" Then 'Manual run with InputFile
            Dim oChilkatBinData As New ChilkatBinData

            oChilkatBinData.LoadFile(strInputFile)

            strInData = oChilkatBinData.GetString("utf-8")
        
            Set oChilkatBinData = Nothing
        Else 'Normal run with call via TeisRS
        	' Fetch json and data from TeisRS call
            Dim oJsonFromTeisRs As New ChilkatJsonObject                            ' Used to contain the complete json from TeisRS

        	oJsonFromTeisRs.Load(oTeisRs.FetchJsonFromTeisRS())                     ' Load TeisRS json into Chilkat json object
        	strInData = oBase64.Base64ToString(oJsonFromTeisRs.StringOf("data"))    ' Fetch decoded datastring from TeisRS json
        
        	' Complete input json from TeisRS
        	strInJson   = oJsonFromTeisRs.Emit
        	If LogLevel = "Debug" Then SysLibLog_ToTraceFile("Json from TeisRS", strInJson, .KeepTraceFiles)
        
        	ReportLog(RL_NORMAL,"||Get data from TeisRS finished")
        
        	iHttpResponseCode = 200

            Set oJsonFromTeisRs = Nothing
        End If

    	' ========== Handle some data here between those lines ==========
    	' Instruction:
    	' - Indata from caller:         strInData
    	' - Input json from caller:     strInJson
    	' - OutData back to caller:     strResponseData
    	' - Set http responsecode in:   iHttpResponseCode (default 200)
    
    	' ========== Handle some data here between those lines ==========

    	' Responde to caller via TeisRS
    	SetData(oTeisRs.CreateResponse(strResponseData, iHttpResponseCode, .strContentType))
    	ReportLog(RL_NORMAL, "||Successful response to caller via TeisRs completed")

    	' Close objects
    	Set oTeisRs = Nothing
    	Set oBase64 = Nothing
    End With
    
	Exit Sub

ErrorHandling:
	If Left(CStr(iHttpResponseCode),1) = "2" Then iHttpResponseCode = 500
	SetData(oTeisRs.CreateResponse("Some error occured when processing the integration: " & Err.Description, iHttpResponseCode))    ' Error response to webservice via TeisRs
	SysLibLog_ReportErrors                                                                                                          ' Error To TEIS Event log
	Quit
End Sub

Sub GetParameters(Parameters As TeisParameters)

	On Error GoTo ErrorHandling 'Turn on default error handling 

	With Parameters
		' TEIS parameters
		.SetMessagePendingTimeOut   = CLng(GetParameter("-SetMessagePendingTimeOut", "1800"))   ' Maximum number of seconds until timeout is reached for the entire task. Default 1800 seconds

		If LogLevel = "Info" Then
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", False))
		Else
			.KeepTraceFiles = CBool(GetParameter("-?KeepTraceFiles", True))
			ReportLog(RL_NORMAL, "||LogLevel is: " & LogLevel)
		End If

		' Script specific parameters
		.strContentType = GetParameter("+ContentType") 'Set this to correct value depending on data back to caller
	End With

	Exit Sub

ErrorHandling: ' Tag, if runtime error occures, the running code steps to this point
	SysLibLog_ErrorHandler("GetParameters@Main" & ", script: " & GetParameter("-ScriptName"))
End Sub
    `;

    // Standard template for new syslib script
    public static syslibScript = `' ==============================================================================================
' SysLib/ClassLib name: <Name of SysLib/ClassLib>
'
' Required TEIS version:
'
' Required System libraries:
'   - SysLibLog
'
' Required Third-Party Objects:
'   - ThirdPartyObjectName, ex Chilkat 9.5.0.90 ->
'
' Description:
'   <Description of the purpose and functionality of the script>
'
' Version information:
'   Version Date            Changed By          Description
'   1.0.0   <YYYY-MM-DD>    <Name of developer> <Comment about changes made, or "First version" for version "1.0.0">
' ==============================================================================================

Option Explicit

'==============================================================================================
' Public SUB - <Example_Sub>
'==============================================================================================
' Sub Description:
'	<Description of the purpose and functionality of the sub.>
'
'	Parameter Information:
'	Parameter Name		Parameter Type		Parameter Description
'	<Argument_1>		<String>					<Path to folder.>
'

Public Sub Example_Sub( ByVal Argument_1  As String)

' Write code here

End Sub
    `;

    // Standard template for new classlib script
    public static classlibScript = `' ==============================================================================================
' SysLib/ClassLib name: <Name of SysLib/ClassLib>
'
' Required TEIS version:
'
' Required System libraries:
'   - SysLibLog
'   - ClassLib_ChilkatPrep
'
' Required Third-Party Objects:
'   - ThirdPartyObjectName, ex Chilkat 9.5.0.90 ->
'
' Description:
'   <Description of the purpose and functionality of the script>
'
' Version information:
'   Version Date            Changed By          Description
'   1.0.0   <YYYY-MM-DD>    <Name of developer> <Comment about changes made, or "First version" for version "1.0.0">
' ==============================================================================================

Option Explicit

    ' This is the name used to reach the ClassLibrary functionality, please change to something use-case related Public Class CL_<Change to use-case related LibraryName>

    ' Change this value to required Chilkat version Const RequiredChilkatVersion = "9.5.0.0" ' This is default value, an example of required value in the class could be 9.5.0.94

    Private Sub Class_Initialize()

        On Error GoTo ErrorHandling

        Dim oPrepChilkatGlobalLicense As New CL_ChilkatLicensePrep
        oPrepChilkatGlobalLicense.PrepChilkatGlobalLicense(RequiredChilkatVersion)
        Set oPrepChilkatGlobalLicense = Nothing

        Exit Sub

    ErrorHandling:
        SysLibLog_ErrorHandler("Class_Initialize")
    End Sub

    Private Sub Class_Terminate()

    End Sub

End Class
    `;

}
