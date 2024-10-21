import disk from 'diskusage';
import os from 'os';
export async function checkDiskUsage(){
  
  let path = os.platform() === 'win32' ? 'c:' : '/';
    try {
      const { free } = await disk.check(path);
      // Convert to GB
      const freeGB = free / 1024 / 1024 / 1024;
      console.log(`Free space: ${freeGB.toFixed(2)} GB`);
      return freeGB.toFixed(2)
    } catch (err) {
      console.error(err)
      return 0
    }

}
