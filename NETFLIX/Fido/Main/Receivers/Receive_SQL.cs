/*
*
*  Copyright 2015 Netflix, Inc.
*
*     Licensed under the Apache License, Version 2.0 (the "License");
*     you may not use this file except in compliance with the License.
*     You may obtain a copy of the License at
*
*         http://www.apache.org/licenses/LICENSE-2.0
*
*     Unless required by applicable law or agreed to in writing, software
*     distributed under the License is distributed on an "AS IS" BASIS,
*     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*     See the License for the specific language governing permissions and
*     limitations under the License.
*
*/

using Fido_Main.Main.Detectors;

namespace Fido_Main.Main.Receivers
{
  static class Receive_SQL
  {
    //DirectorToEngine is the handler for SQL based detectors. It is designed
    //to initiate and direct configured SQL detectors to their respective module
    public static void DirectToEngine(string sDetector, string sVendor)
    {
      switch (sDetector)
      {
        case "sql":
          switch (sVendor)
          {
            case "bit9":
              Detect_Bit9.GetEvents();
              break;
            case "fido":
              break;
          }

          break;
      }

    }

  }
}
