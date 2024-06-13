// use std::fs::File;
// use std::io::{Read, Write};
// use std::path::Path;
// use zip::write::ExtendedFileOptions;
// use zip::{CompressionMethod, write::FileOptions, ZipWriter, read::ZipArchive};

// pub fn zip_files(input_paths: Vec<&Path>, output_path: &Path) -> zip::result::ZipResult<()> {
//     let file = File::create(output_path)?;
//     let mut zip = ZipWriter::new(file);

//     let options = FileOptions::default()
//         .compression_method(CompressionMethod::Stored)
//         .unix_permissions(0o755);

//     for path in input_paths {
//         zip.start_file(path.to_string_lossy(), options)?;
//         let mut f = File::open(path)?;
//         let mut buffer = Vec::new();
//         f.read_to_end(&mut buffer)?;
//         zip.write_all(&buffer)?;
//     }

//     zip.finish()?;

//     Ok(())
// }

// pub fn unzip_file(input_path: &Path, output_folder: &Path) -> zip::result::ZipResult<()> {
//     let file = File::open(input_path)?;
//     let mut archive = ZipArchive::new(file)?;

//     for i in 0..archive.len() {
//         let mut file = archive.by_index(i)?;
//         let outpath = output_folder.join(file.name());

//         if (&*file.name()).ends_with('/') {
//             std::fs::create_dir_all(&outpath)?;
//         } else {
//             if let Some(p) = outpath.parent() {
//                 if !p.exists() {
//                     std::fs::create_dir_all(&p)?;
//                 }
//             }
//             let mut outfile = File::create(&outpath)?;
//             std::io::copy(&mut file, &mut outfile)?;
//         }
//     }

//     Ok(())
// }
