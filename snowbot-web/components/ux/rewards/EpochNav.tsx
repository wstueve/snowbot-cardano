// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useEpochs } from "../../providers/reward";

export default function EpochNav () {
    const [index, setIndex] = useState<number>(0);
    const [indexShowStart, setIndexShowStart] = useState<number>(0);
    const [indexShowEnd, setIndexShowEnd] = useState<number>(0);
    const [epochs, setEpochs] = useState<any>(undefined);

    const {     
      selectEpoch,
      isLoading,
      epochsData
    } = useEpochs();

    useEffect(() => {
      if(!!epochsData && epochsData.length > 0) { 
        const _epochs = JSON.parse(epochsData);
        setEpochs(_epochs);
  
        setIndex(0);
        selectEpoch(_epochs[0]);
        const indexShowStart = (index >= _epochs.length - 2) ? _epochs.length - 5 : Math.max(index - 2, 0);
        const indexShowEnd = (index <= 1) ? 4 : Math.min(index + 2, _epochs.length - 1);
  
        setIndexShowStart(indexShowStart);
        setIndexShowEnd(indexShowEnd);
      }
    }, [epochsData]);

    //TODO: Check out how to set this in app
    //https://stackoverflow.com/questions/60755316/next-js-getserversideprops-show-loading/60756105#60756105
    //https://stackoverflow.com/questions/69263469/next-js-getserversideprops-loading-state
    
    if (isLoading) return <div>Loading...</div>

    function handleEpochClick(i: number) {
        setIndex(i);
        selectEpoch(epochs[i]);
    }

    function getEpochsShown() {
        let retval = [];
        for (let i = indexShowStart; i <= indexShowEnd; i++) {
            if (index === i) {
                retval[i] = (<button
                    key={epochs[i].id}
                    aria-current="page"
                    className="relative z-10 inline-flex items-center bg-transparent text-blue-900 font-semibold py-2 px-4 border border-blue-700 rounded"
                    >
                        {epochs[i].epochNumber}
                    </button>);
            } else {
                retval[i] = (<button
                  key={epochs[i].id}
                  className="relative inline-flex items-center bg-transparent hover:bg-blue-600 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                onClick={() => handleEpochClick(i)}
                >
                    {epochs[i].epochNumber}
                </button>);
            }
        };
        return retval;
    }

    return (
      epochs && epochs.length > 0 ? (
        <div className="flex items-center justify-between bg-transparent px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden space-x-4">
            <button
              className="relative inline-flex items-center bg-transparent hover:bg-blue-600 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
              onClick={() => (index > 0) ? handleEpochClick(index - 1) : {} }
            >
              Previous
            </button>
            <button
              className="relative inline-flex items-center bg-transparent hover:bg-blue-600 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
              onClick={() => (index < epochs.length - 1) ? handleEpochClick(index + 1) : {}}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between sm:space-x-8">
            <div>
              <nav className="isolate inline-flex rounded-md shadow-sm space-x-2" aria-label="Pagination">
                <button
                  className="relative inline-flex items-center bg-transparent hover:bg-blue-600 text-blue-500 font-semibold hover:text-white py-2 px-2 border border-blue-500 hover:border-transparent rounded"
                  onClick={() => (index > 0) ? handleEpochClick(index - 1) : {} }
                >
                  <span className="sr-only">Previous</span>
                  <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>            
                {getEpochsShown()}
                <button
                  className="relative inline-flex items-center bg-transparent hover:bg-blue-600 text-blue-500 font-semibold hover:text-white py-2 px-2 border border-blue-500 hover:border-transparent rounded"
                  onClick={() => (index < epochs.length - 1) ? handleEpochClick(index + 1) : {}}
                >
                  <span className="sr-only">Next</span>
                  <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>) : <div>Loading .....</div>
    );
}