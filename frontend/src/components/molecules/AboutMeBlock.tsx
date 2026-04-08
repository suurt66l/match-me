interface Props {
    aboutMe: string;
    expanded: boolean;
    setExpand: (value: boolean) => void;
}

export default function AboutMeBlock({aboutMe, expanded, setExpand}: Props){
    return(
          <div className="rounded-lg text-sm text-amber-950">
            <div className="rounded-t-lg text-sm px-3 py-2 bg-amber-400">
                <label>About Me</label>
            </div>
              {/* In case of long About Me -- shtrink at and hide behing the "read more..." button */}
              {aboutMe.length > 50 
                ? <>
                    <div className="rounded-b-lg px-3 py-2 bg-amber-300 cursor-pointer" onClick={() => setExpand(true)}>
                      {aboutMe.slice(0, 50)}
                      <span className="font-bold text-amber-700 cursor-pointer hover:text-amber-900"> . . . read more → </span>
                    </div>
                  </>
                : <>
                    <div className="rounded-b-lg px-3 py-2 bg-amber-300">
                      {aboutMe}
                    </div>
                  </>
              }

              {expanded && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setExpand(false)}>
                <div className="bg-amber-300 rounded-xl px-6 py-5 max-w-sm mx-4">
                  <p className="text-amber-950 text-sm">{aboutMe}</p>
                </div>
              </div>
              )}
          </div>
    );
}