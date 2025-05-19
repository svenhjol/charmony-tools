package svenhjol.charmony.example_template.common;

import net.fabricmc.api.ModInitializer;
import svenhjol.charmony.core.enums.Side;

public final class CommonInitializer implements ModInitializer {
    @Override
    public void onInitialize() {
        // Ensure charmony is launched first.
        svenhjol.charmony.core.common.CommonInitializer.init();

        // Prepare and run the mod.
        var mod = ExampleTemplateMod.instance();
        mod.run(Side.Common);
    }
}
