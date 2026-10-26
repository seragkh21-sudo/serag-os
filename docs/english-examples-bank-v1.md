# Grammar Example Bank v1

## Scope
The bank aggregates the example sentences already authored in the Serag English curriculum. It combines repeated lesson IDs without mutating the source arrays, and gives every example a stable ID tied to its lesson. Learners can search sentences and rule names and filter by CEFR level or lesson. A result can open the existing rule explanation.

## Additional public source
The [SCoRE corpus site](https://score.ddl-study.org/en/) offers more than 10,000 level-specific examples across 22 grammar categories, with Japanese translations. Its website content is licensed CC BY-NC-SA 4.0 and requires attribution. This release links to SCoRE instead of copying its separately licensed records into Serag. An actual SCoRE import should be a separate data change with source attribution, share-alike terms and explicit record provenance.

## Data handling
- No network call is made by the local bank.
- No quiz/question arrays, Supabase tables or user records are modified.
- Existing lesson examples remain the source of truth.
- No paid API or additional package is introduced.
