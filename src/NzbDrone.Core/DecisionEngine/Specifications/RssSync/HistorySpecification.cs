using System;
using System.Collections.Generic;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.History;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Profiles.Releases;
using NzbDrone.Core.Qualities;

namespace NzbDrone.Core.DecisionEngine.Specifications.RssSync
{
    public class HistorySpecification : IDecisionEngineSpecification
    {
        private readonly IHistoryService _historyService;
        private readonly UpgradableSpecification _upgradableSpecification;
        private readonly ICustomFormatCalculationService _formatService;
        private readonly IConfigService _configService;
        private readonly Logger _logger;

        public HistorySpecification(IHistoryService historyService,
                                    UpgradableSpecification upgradableSpecification,
                                    ICustomFormatCalculationService formatService,
                                    IConfigService configService,
                                    Logger logger)
        {
            _historyService = historyService;
            _upgradableSpecification = upgradableSpecification;
            _formatService = formatService;
            _configService = configService;
            _logger = logger;
        }

        public SpecificationPriority Priority => SpecificationPriority.Database;
        public RejectionType Type => RejectionType.Permanent;

        public virtual Decision IsSatisfiedBy(RemoteBook subject, SearchCriteriaBase searchCriteria)
        {
            if (searchCriteria != null)
            {
                _logger.Debug("Skipping history check during search");
                return Decision.Accept();
            }

            var cdhEnabled = _configService.EnableCompletedDownloadHandling;

            _logger.Debug("Performing history status check on report");
            foreach (var book in subject.Books)
            {
                _logger.Debug("Checking current status of book [{0}] in history", book.Id);
                var mostRecent = _historyService.MostRecentForBook(book.Id);

                if (mostRecent != null && mostRecent.EventType == EntityHistoryEventType.Grabbed)
                {
                    var recent = mostRecent.Date.After(DateTime.UtcNow.AddHours(-12));

                    if (!recent && cdhEnabled)
                    {
                        continue;
                    }

                    var customFormats = _formatService.ParseCustomFormat(mostRecent, subject.Author);

                    // The series will be the same as the one in history since it's the same episode.
                    // Instead of fetching the series from the DB reuse the known series.
                    var cutoffUnmet = _upgradableSpecification.CutoffNotMet(
                        subject.Author.QualityProfile,
                        new List<QualityModel> { mostRecent.Quality },
                        customFormats,
                        subject.ParsedBookInfo.Quality);

                    var upgradeable = _upgradableSpecification.IsUpgradable(
                        subject.Author.QualityProfile,
                        mostRecent.Quality,
                        customFormats,
                        subject.ParsedBookInfo.Quality,
                        subject.CustomFormats);

                    if (!cutoffUnmet)
                    {
                        if (recent)
                        {
                            return Decision.Reject("Recent grab event in history already meets cutoff: {0}", mostRecent.Quality);
                        }

                        return Decision.Reject("CDH is disabled and grab event in history already meets cutoff: {0}", mostRecent.Quality);
                    }

                    if (!upgradeable)
                    {
                        if (recent)
                        {
                            return Decision.Reject("Recent grab event in history is of equal or higher quality: {0}", mostRecent.Quality);
                        }

                        return Decision.Reject("CDH is disabled and grab event in history is of equal or higher quality: {0}", mostRecent.Quality);
                    }
                }
            }

            return Decision.Accept();
        }
    }
}
