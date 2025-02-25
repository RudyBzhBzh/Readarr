using NzbDrone.Core.ImportLists;
using NzbDrone.Core.Validation;
using NzbDrone.Core.Validation.Paths;
using Readarr.Http;

namespace Readarr.Api.V1.ImportLists
{
    [V1ApiController]
    public class ImportListController : ProviderControllerBase<ImportListResource, IImportList, ImportListDefinition>
    {
        public static readonly ImportListResourceMapper ResourceMapper = new ImportListResourceMapper();

        public ImportListController(IImportListFactory importListFactory,
                                    QualityProfileExistsValidator qualityProfileExistsValidator,
                                    MetadataProfileExistsValidator metadataProfileExistsValidator)
            : base(importListFactory, "importlist", ResourceMapper)
        {
            Http.Validation.RuleBuilderExtensions.ValidId(SharedValidator.RuleFor(s => s.QualityProfileId));
            Http.Validation.RuleBuilderExtensions.ValidId(SharedValidator.RuleFor(s => s.MetadataProfileId));

            SharedValidator.RuleFor(c => c.RootFolderPath).IsValidPath();
            SharedValidator.RuleFor(c => c.QualityProfileId).SetValidator(qualityProfileExistsValidator);
            SharedValidator.RuleFor(c => c.MetadataProfileId).SetValidator(metadataProfileExistsValidator);
        }
    }
}
